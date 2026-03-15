"""
habilitacion/models.py

Modelos transaccionales para la habilitación de servicios de salud.
Integración con los modelos core (Company, Headquarters).
DatosPrestador vinculado a Headquarters (OneToOne) para permitir habilitación
de una única sede o múltiples sedes de la misma empresa.
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from companies.models import Company, Headquarters
from normativity.models import Criterio
from processes.models import Documento

User = get_user_model()


class DatosPrestador(models.Model):
    """
    Datos específicos de habilitación vinculados a una Headquarters (Sede).
    ForeignKey: Una sede puede tener múltiples prestadores habilitados.
    Cada prestador está identificado únicamente por su código REPS.
    """
    
    CLASE_PRESTADOR_CHOICES = [
        ('IPS', 'Institución Prestadora de Servicios'),
        ('PROF', 'Profesional de Salud'),
        ('PH', 'Persona Humana'),
        ('PJ', 'Persona Jurídica'),
    ]
    
    ESTADO_HABILITACION_CHOICES = [
        ('HABILITADA', 'Habilitada'),
        ('EN_PROCESO', 'En Proceso'),
        ('SUSPENDIDA', 'Suspendida'),
        ('NO_HABILITADA', 'No Habilitada'),
        ('CANCELADA', 'Cancelada'),
    ]
    
    headquarters = models.ForeignKey(
        Headquarters,
        on_delete=models.PROTECT,
        related_name='prestadores_habilitados',
        verbose_name="Sede (Headquarters)"
    )
    
    # Identificación REPS
    codigo_reps = models.CharField(
        max_length=20,
        unique=True,
        verbose_name="Código REPS",
        help_text="Código de registro en REPS de la Superintendencia de Salud"
    )
    nombre_prestador = models.CharField(
        max_length=255,
        verbose_name="Nombre del Prestador",
        help_text="Nombre del prestador de servicios de salud"
    )
    sede_principal = models.BooleanField(
        default=False,
        verbose_name="Es Sede Principal",
        help_text="Indica si esta es la sede principal del prestador"
    )
    clase_prestador = models.CharField(
        max_length=10,
        choices=CLASE_PRESTADOR_CHOICES,
        verbose_name="Clase de Prestador"
    )
    
    # Información de habilitación
    estado_habilitacion = models.CharField(
        max_length=20,
        choices=ESTADO_HABILITACION_CHOICES,
        default='EN_PROCESO',
        verbose_name="Estado de Habilitación"
    )
    fecha_inscripcion = models.DateField(
        blank=True,
        null=True,
        verbose_name="Fecha de Inscripción en REPS"
    )
    fecha_renovacion = models.DateField(
        blank=True,
        null=True,
        verbose_name="Fecha de Última Renovación"
    )
    fecha_vencimiento_habilitacion = models.DateField(
        blank=True,
        null=True,
        verbose_name="Fecha de Vencimiento de Habilitación"
    )
    
    # Información complementaria
    aseguradora_pep = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Aseguradora de Responsabilidad Civil"
    )
    numero_poliza = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name="Número de Póliza"
    )
    vigencia_poliza = models.DateField(
        blank=True,
        null=True,
        verbose_name="Vigencia de Póliza"
    )
    
    # Auditoría
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Fecha de Creación"
    )
    fecha_actualizacion = models.DateTimeField(
        auto_now=True,
        verbose_name="Fecha de Actualización"
    )
    usuario_responsable = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='datos_prestador_creado',
        verbose_name="Usuario Responsable"
    )
    
    class Meta:
        db_table = "habilitacion_datosprestador"
        verbose_name = "Datos de Prestador"
        verbose_name_plural = "Datos de Prestadores"
    
    def __str__(self):
        return f"{self.codigo_reps} - {self.headquarters.name}"
    
    def dias_para_vencimiento(self):
        """Calcular días para vencimiento de habilitación."""
        if not self.fecha_vencimiento_habilitacion:
            return None
        delta = self.fecha_vencimiento_habilitacion - timezone.now().date()
        return delta.days
    
    def esta_proxima_a_vencer(self, dias=90):
        """Verificar si la habilitación está próxima a vencer."""
        dias_falta = self.dias_para_vencimiento()
        if dias_falta is None:
            return False
        return 0 <= dias_falta <= dias
    
    def esta_vencida(self):
        """Verificar si la habilitación ya venció."""
        dias_falta = self.dias_para_vencimiento()
        if dias_falta is None:
            return False
        return dias_falta < 0


class ServicioSede(models.Model):
    """
    Servicios de salud habilitados en una sede específica.
    Un servicio es la combinación de modalidad + tipo en una sede determinada.
    """
    
    MODALIDAD_CHOICES = [
        ('INTRAMURAL', 'Intramural'),
        ('AMBULATORIA', 'Ambulatoria'),
        ('TELEMEDICINA', 'Telemedicina'),
        ('URGENCIAS', 'Urgencias'),
        ('AMBULANCIA', 'Ambulancia'),
    ]
    
    COMPLEJIDAD_CHOICES = [
        ('BAJA', 'Baja'),
        ('MEDIA', 'Media'),
        ('ALTA', 'Alta'),
    ]
    
    ESTADO_HABILITACION_CHOICES = [
        ('HABILITADO', 'Habilitado'),
        ('EN_PROCESO', 'En Proceso'),
        ('SUSPENDIDO', 'Suspendido'),
        ('NO_HABILITADO', 'No Habilitado'),
        ('CANCELADO', 'Cancelado'),
    ]
    
    prestador = models.ForeignKey(
        DatosPrestador,
        on_delete=models.PROTECT,
        related_name='servicios_salud',
        verbose_name="Prestador",
    )
    
    # Identificación del servicio
    codigo_servicio = models.CharField(
        max_length=20,
        verbose_name="Código del Servicio",
        help_text="Código asignado por REPS para este servicio"
    )
    nombre_servicio = models.CharField(
        max_length=255,
        verbose_name="Nombre del Servicio"
    )
    descripcion = models.TextField(
        blank=True,
        null=True,
        verbose_name="Descripción del Servicio"
    )
    
    # Clasificación
    modalidad = models.CharField(
        max_length=20,
        choices=MODALIDAD_CHOICES,
        verbose_name="Modalidad"
    )
    complejidad = models.CharField(
        max_length=10,
        choices=COMPLEJIDAD_CHOICES,
        verbose_name="Complejidad"
    )
    
    # Estado
    estado_habilitacion = models.CharField(
        max_length=20,
        choices=ESTADO_HABILITACION_CHOICES,
        default='EN_PROCESO',
        verbose_name="Estado de Habilitación"
    )
    fecha_habilitacion = models.DateField(
        blank=True,
        null=True,
        verbose_name="Fecha de Habilitación"
    )
    fecha_vencimiento = models.DateField(
        blank=True,
        null=True,
        verbose_name="Fecha de Vencimiento"
    )
    
    # Auditoría
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Fecha de Creación"
    )
    fecha_actualizacion = models.DateTimeField(
        auto_now=True,
        verbose_name="Fecha de Actualización"
    )
    
    class Meta:
        db_table = "habilitacion_serviciosede"
        verbose_name = "Servicio de Prestador"
        verbose_name_plural = "Servicios de Prestador"
        unique_together = ('prestador', 'codigo_servicio')
        indexes = [
            models.Index(fields=['prestador', 'estado_habilitacion']),
            models.Index(fields=['estado_habilitacion']),
        ]
    
    def __str__(self):
        return f"{self.codigo_servicio} - {self.nombre_servicio}"
    
    def dias_para_vencimiento(self):
        """Calcular días para vencimiento del servicio."""
        if not self.fecha_vencimiento:
            return None
        delta = self.fecha_vencimiento - timezone.now().date()
        return delta.days
    
    def esta_vencido(self):
        """Verificar si el servicio está vencido."""
        dias_falta = self.dias_para_vencimiento()
        if dias_falta is None:
            return False
        return dias_falta < 0


class Autoevaluacion(models.Model):
    """
    Autoevaluación anual de la IPS contra los criterios de la Resolución 3100.
    Control de vigencia: Las autoevaluaciones son anuales.
    """
    
    ESTADO_CHOICES = [
        ('BORRADOR', 'Borrador'),
        ('EN_CURSO', 'En Curso'),
        ('COMPLETADA', 'Completada'),
        ('REVISADA', 'Revisada por Auditor'),
        ('VALIDADA', 'Validada'),
    ]
    
    PERIODO_CHOICES = [
        (2024, '2024'),
        (2025, '2025'),
        (2026, '2026'),
        (2027, '2027'),
        (2028, '2028'),
    ]
    
    datos_prestador = models.ForeignKey(
        DatosPrestador,
        on_delete=models.PROTECT,
        related_name='autoevaluaciones',
        verbose_name="Prestador"
    )
    
    # Identificación
    periodo = models.IntegerField(
        choices=PERIODO_CHOICES,
        verbose_name="Período Fiscal"
    )
    numero_autoevaluacion = models.CharField(
        max_length=50,
        verbose_name="Número de Autoevaluación",
        help_text="Identificador único: AUT-CODIGO_REPS-PERIODO"
    )
    
    # Control de versiones
    version = models.PositiveIntegerField(
        default=1,
        verbose_name="Versión"
    )
    
    # Fechas
    fecha_inicio = models.DateField(
        auto_now_add=True,
        verbose_name="Fecha de Inicio"
    )
    fecha_completacion = models.DateField(
        blank=True,
        null=True,
        verbose_name="Fecha de Completación"
    )
    fecha_vencimiento = models.DateField(
        verbose_name="Fecha de Vencimiento",
        help_text="Fecha hasta la cual esta autoevaluación es válida"
    )
    
    # Estado
    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default='BORRADOR',
        verbose_name="Estado"
    )
    
    # Responsable
    usuario_responsable = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='autoevaluaciones_responsable',
        verbose_name="Responsable"
    )
    
    # Notas
    observaciones = models.TextField(
        blank=True,
        null=True,
        verbose_name="Observaciones"
    )
    
    # Auditoría
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Fecha de Creación"
    )
    fecha_actualizacion = models.DateTimeField(
        auto_now=True,
        verbose_name="Fecha de Actualización"
    )
    
    class Meta:
        db_table = "habilitacion_autoevaluacion"
        verbose_name = "Autoevaluación"
        verbose_name_plural = "Autoevaluaciones"
        unique_together = ('datos_prestador', 'periodo', 'version')
        ordering = ['-periodo', '-version']
        indexes = [
            models.Index(fields=['datos_prestador', 'periodo']),
            models.Index(fields=['estado']),
        ]
    
    def __str__(self):
        return f"AUT-{self.datos_prestador.codigo_reps}-{self.periodo} v{self.version}"
    
    def save(self, *args, **kwargs):
        """Generar automáticamente el número de autoevaluación si no existe."""
        if not self.numero_autoevaluacion:
            self.numero_autoevaluacion = f"AUT-{self.datos_prestador.codigo_reps}-{self.periodo}"
        super().save(*args, **kwargs)
    
    def porcentaje_cumplimiento(self):
        """Calcular porcentaje general de cumplimiento."""
        total = self.cumplimientos.count()
        if total == 0:
            return 0
        # Contar solo CUMPLE y PARCIALMENTE como cumplimientos
        cumplidos = self.cumplimientos.filter(
            cumple__in=['CUMPLE', 'PARCIALMENTE']
        ).count()
        return round((cumplidos / total) * 100, 2)
    
    def esta_vigente(self):
        """Verificar si la autoevaluación está vigente."""
        if not self.fecha_vencimiento:
            return False
        return self.fecha_vencimiento >= timezone.now().date()


class Cumplimiento(models.Model):
    """
    Registro de cumplimiento de un criterio específico.
    Pivote: Autoevaluacion + ServicioSede + Criterio.
    
    Enlaza la autoevaluación con la evidencia documental (app processes).
    """
    
    RESULTADO_CHOICES = [
        ('CUMPLE', 'Cumple'),
        ('NO_CUMPLE', 'No Cumple'),
        ('PARCIALMENTE', 'Parcialmente'),
        ('NO_APLICA', 'No Aplica'),
    ]
    
    autoevaluacion = models.ForeignKey(
        Autoevaluacion,
        on_delete=models.PROTECT,
        related_name='cumplimientos',
        verbose_name="Autoevaluación"
    )
    servicio_sede = models.ForeignKey(
        ServicioSede,
        on_delete=models.PROTECT,
        related_name='cumplimientos',
        verbose_name="Servicio de Sede"
    )
    criterio = models.ForeignKey(
        Criterio,
        on_delete=models.PROTECT,
        related_name='cumplimientos',
        verbose_name="Criterio"
    )
    
    # Evaluación
    cumple = models.CharField(
        max_length=20,
        choices=RESULTADO_CHOICES,
        verbose_name="Resultado de Cumplimiento"
    )
    
    # Evidencia
    documentos_evidencia = models.ManyToManyField(
        Documento,
        blank=True,
        related_name='cumplimientos',
        verbose_name="Documentos de Evidencia"
    )
    
    # Análisis
    hallazgo = models.TextField(
        blank=True,
        null=True,
        verbose_name="Hallazgo/Observación"
    )
    plan_mejora = models.TextField(
        blank=True,
        null=True,
        verbose_name="Plan de Mejora"
    )
    responsable_mejora = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cumplimientos_responsable',
        verbose_name="Responsable de Mejora"
    )
    fecha_compromiso = models.DateField(
        blank=True,
        null=True,
        verbose_name="Fecha Comprometida para Mejora"
    )
    
    # Auditoría
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Fecha de Creación"
    )
    fecha_actualizacion = models.DateTimeField(
        auto_now=True,
        verbose_name="Fecha de Actualización"
    )
    
    class Meta:
        db_table = "habilitacion_cumplimiento"
        verbose_name = "Cumplimiento"
        verbose_name_plural = "Cumplimientos"
        unique_together = ('autoevaluacion', 'servicio_sede', 'criterio')
        indexes = [
            models.Index(fields=['autoevaluacion', 'cumple']),
            models.Index(fields=['criterio']),
        ]
    
    def __str__(self):
        return f"{self.autoevaluacion} - {self.criterio.codigo}: {self.cumple}"
    
    def tiene_plan_mejora(self):
        """Verificar si hay plan de mejora pendiente."""
        return self.plan_mejora and not self.fecha_compromiso
    
    def mejora_vencida(self):
        """Verificar si la fecha de compromiso ya pasó."""
        if not self.fecha_compromiso:
            return False
        return self.fecha_compromiso < timezone.now().date()



## ------------
"""
habilitacion/views.py

ViewSets para la API de habilitación de servicios de salud.
Incluye lógica transaccional, filtrado avanzado y acciones personalizadas.
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Q, Count, Avg, Case, When, IntegerField
from datetime import timedelta

from .models import DatosPrestador, ServicioSede, Autoevaluacion, Cumplimiento
from .serializers import (
    DatosPrestadorListSerializer,
    DatosPrestadorDetailSerializer,
    ServicioSedeListSerializer,
    ServicioSedeDetailSerializer,
    AutoevaluacionListSerializer,
    AutoevaluacionDetailSerializer,
    CumplimientoListSerializer,
    CumplimientoDetailSerializer,
)


class DatosPrestadorViewSet(viewsets.ModelViewSet):
    """
    API para gestionar datos de habilitación de prestadores.
    
    - GET /api/habilitacion/prestadores/ → Listar todos
    - POST /api/habilitacion/prestadores/ → Crear nuevo
    - GET /api/habilitacion/prestadores/{id}/ → Detalle
    - PUT /api/habilitacion/prestadores/{id}/ → Actualizar completo
    - PATCH /api/habilitacion/prestadores/{id}/ → Actualizar parcial
    - DELETE /api/habilitacion/prestadores/{id}/ → Eliminar
    
    Acciones personalizadas:
    - GET /api/habilitacion/prestadores/proximos_a_vencer/ → Vencimiento próximo
    - GET /api/habilitacion/prestadores/{id}/servicios/ → Servicios del prestador
    - GET /api/habilitacion/prestadores/{id}/renovar/ → Preparar renovación
    """
    
    queryset = DatosPrestador.objects.select_related('headquarters', 'headquarters__company', 'usuario_responsable')
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = [
        'estado_habilitacion',
        'clase_prestador',
    ]
    search_fields = [
        'codigo_reps',
        'company__name',
    ]
    ordering_fields = [
        'fecha_vencimiento_habilitacion',
        'fecha_creacion',
    ]
    ordering = ['-fecha_creacion']
    
    def get_serializer_class(self):
        """Usa serializer simplificado para list, detallado para otros."""
        if self.action == 'list':
            return DatosPrestadorListSerializer
        return DatosPrestadorDetailSerializer
    
    def perform_create(self, serializer):
        """Asignar usuario responsable al crear."""
        serializer.save(usuario_responsable=self.request.user)
    
    @action(detail=False, methods=['get'])
    def proximos_a_vencer(self, request):
        """Prestadores con habilitación próxima a vencer (próximos 90 días)."""
        hoy = timezone.now().date()
        limite = hoy + timedelta(days=90)
        
        queryset = self.queryset.filter(
            fecha_vencimiento_habilitacion__gte=hoy,
            fecha_vencimiento_habilitacion__lte=limite,
            estado_habilitacion='HABILITADA'
        ).order_by('fecha_vencimiento_habilitacion')
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = DatosPrestadorListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = DatosPrestadorListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def vencidas(self, request):
        """Prestadores con habilitación vencida."""
        hoy = timezone.now().date()
        queryset = self.queryset.filter(
            fecha_vencimiento_habilitacion__lt=hoy
        ).order_by('fecha_vencimiento_habilitacion')
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = DatosPrestadorListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = DatosPrestadorListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def servicios(self, request, pk=None):
        """Servicios habilitados de un prestador (por sede)."""
        prestador = self.get_object()
        servicios = ServicioSede.objects.filter(
            prestador=prestador
        )
        
        serializer = ServicioSedeListSerializer(servicios, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def autoevaluaciones(self, request, pk=None):
        """Historial de autoevaluaciones de un prestador."""
        prestador = self.get_object()
        autoevaluaciones = prestador.autoevaluaciones.all().order_by('-periodo')
        
        page = self.paginate_queryset(autoevaluaciones)
        if page is not None:
            serializer = AutoevaluacionListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = AutoevaluacionListSerializer(autoevaluaciones, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def iniciar_renovacion(self, request, pk=None):
        """Iniciar proceso de renovación de habilitación."""
        prestador = self.get_object()
        
        # Validar que pueda renovarse
        if not prestador.esta_proxima_a_vencer(dias=180):
            return Response(
                {
                    'error': 'Solo se puede renovar hasta 180 días antes del vencimiento.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Cambiar estado a EN_PROCESO
        prestador.estado_habilitacion = 'EN_PROCESO'
        prestador.save()
        
        serializer = self.get_serializer(prestador)
        return Response(serializer.data)


class ServicioSedeViewSet(viewsets.ModelViewSet):
    """
    API para gestionar servicios de salud por sede.
    
    Acciones personalizadas:
    - GET /api/habilitacion/servicios/proximos_a_vencer/ → Servicios próximos a vencer
    - GET /api/habilitacion/servicios/por_complejidad/?complejidad=ALTA → Filtrar por complejidad
    - GET /api/habilitacion/servicios/{id}/cumplimientos/ → Cumplimientos del servicio
    """
    
    queryset = ServicioSede.objects.select_related('prestador', 'prestador__headquarters', 'prestador__headquarters__company')
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = [
        'prestador',
        'modalidad',
        'complejidad',
        'estado_habilitacion',
    ]
    search_fields = [
        'codigo_servicio',
        'nombre_servicio',
        'prestador__codigo_reps',
    ]
    ordering_fields = [
        'fecha_vencimiento',
        'complejidad',
    ]
    ordering = ['-fecha_vencimiento']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ServicioSedeListSerializer
        return ServicioSedeDetailSerializer
    
    @action(detail=False, methods=['get'])
    def proximos_a_vencer(self, request):
        """Servicios próximos a vencer (próximos 90 días)."""
        hoy = timezone.now().date()
        limite = hoy + timedelta(days=90)
        
        queryset = self.queryset.filter(
            fecha_vencimiento__gte=hoy,
            fecha_vencimiento__lte=limite,
            estado_habilitacion='HABILITADO'
        ).order_by('fecha_vencimiento')
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = ServicioSedeListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = ServicioSedeListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def por_complejidad(self, request):
        """Filtrar servicios por nivel de complejidad."""
        complejidad = request.query_params.get('complejidad')
        if not complejidad:
            return Response(
                {'error': 'Parámetro complejidad requerido (BAJA, MEDIA, ALTA)'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.queryset.filter(
            complejidad=complejidad
        )
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = ServicioSedeListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = ServicioSedeListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def cumplimientos(self, request, pk=None):
        """Cumplimientos evaluados del servicio en autoevaluaciones."""
        servicio = self.get_object()
        
        # Filtrar por autoevaluación si se especifica
        autoevaluacion_id = request.query_params.get('autoevaluacion_id')
        cumplimientos = servicio.cumplimientos.all()
        
        if autoevaluacion_id:
            cumplimientos = cumplimientos.filter(
                autoevaluacion_id=autoevaluacion_id
            )
        
        page = self.paginate_queryset(cumplimientos.order_by('-fecha_actualizacion'))
        if page is not None:
            serializer = CumplimientoListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = CumplimientoListSerializer(cumplimientos, many=True)
        return Response(serializer.data)


class AutoevaluacionViewSet(viewsets.ModelViewSet):
    """
    API para gestionar autoevaluaciones anuales.
    
    Acciones personalizadas:
    - GET /api/habilitacion/autoevaluaciones/por_completar/ → Pendientes de completar
    - GET /api/habilitacion/autoevaluaciones/{id}/resumen/ → Resumen estadístico
    - POST /api/habilitacion/autoevaluaciones/{id}/validar/ → Validar autoevaluación
    - POST /api/habilitacion/autoevaluaciones/{id}/duplicar/ → Crear nueva versión (copiar)
    """
    
    queryset = Autoevaluacion.objects.select_related(
        'datos_prestador',
        'datos_prestador__headquarters',
        'datos_prestador__headquarters__company',
        'usuario_responsable'
    ).prefetch_related('cumplimientos')
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = [
        'datos_prestador',
        'periodo',
        'estado',
    ]
    search_fields = [
        'numero_autoevaluacion',
        'datos_prestador__codigo_reps',
    ]
    ordering_fields = [
        'periodo',
        'estado',
        'fecha_vencimiento',
    ]
    ordering = ['-periodo', '-version']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return AutoevaluacionListSerializer
        return AutoevaluacionDetailSerializer
    
    def perform_create(self, serializer):
        """Asignar usuario responsable y generar número."""
        autoevaluacion = serializer.save(usuario_responsable=self.request.user)
        # Generar número único
        autoevaluacion.numero_autoevaluacion = (
            f"AUT-{autoevaluacion.datos_prestador.codigo_reps}"
            f"-{autoevaluacion.periodo}-v{autoevaluacion.version}"
        )
        autoevaluacion.save()
    
    @action(detail=False, methods=['get'])
    def por_completar(self, request):
        """Autoevaluaciones no completadas."""
        queryset = self.queryset.filter(
            estado__in=['BORRADOR', 'EN_CURSO']
        )
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = AutoevaluacionListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = AutoevaluacionListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def resumen(self, request, pk=None):
        """Resumen estadístico de la autoevaluación."""
        autoevaluacion = self.get_object()
        
        cumplimientos = autoevaluacion.cumplimientos.all()
        
        stats = {
            'numero_autoevaluacion': autoevaluacion.numero_autoevaluacion,
            'periodo': autoevaluacion.periodo,
            'estado': autoevaluacion.get_estado_display(),
            'total_cumplimientos': cumplimientos.count(),
            'resumen_por_resultado': {
                'cumple': cumplimientos.filter(cumple='CUMPLE').count(),
                'no_cumple': cumplimientos.filter(cumple='NO_CUMPLE').count(),
                'parcialmente': cumplimientos.filter(cumple='PARCIALMENTE').count(),
                'no_aplica': cumplimientos.filter(cumple='NO_APLICA').count(),
            },
            'porcentaje_cumplimiento': round(
                autoevaluacion.porcentaje_cumplimiento(), 2
            ),
            'pendientes_mejora': cumplimientos.filter(
                plan_mejora__isnull=False
            ).count(),
            'mejoras_vencidas': cumplimientos.filter(
                fecha_compromiso__lt=timezone.now().date(),
                cumple='NO_CUMPLE'
            ).count(),
        }
        
        return Response(stats)
    
    @action(detail=True, methods=['post'])
    def validar(self, request, pk=None):
        """Cambiar estado a VALIDADA."""
        autoevaluacion = self.get_object()
        
        if autoevaluacion.estado == 'VALIDADA':
            return Response(
                {'error': 'La autoevaluación ya fue validada.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        autoevaluacion.estado = 'VALIDADA'
        autoevaluacion.fecha_completacion = timezone.now().date()
        autoevaluacion.save()
        
        serializer = self.get_serializer(autoevaluacion)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def duplicar(self, request, pk=None):
        """
        Crear nueva versión copiando datos de esta autoevaluación.
        Útil para renovación anual.
        """
        autoevaluacion = self.get_object()
        
        # Calcular próximo periodo y versión
        siguiente_periodo = autoevaluacion.periodo + 1
        siguiente_version = 1
        
        # Crear nueva autoevaluación
        nueva_autoevaluacion = Autoevaluacion.objects.create(
            datos_prestador=autoevaluacion.datos_prestador,
            periodo=siguiente_periodo,
            version=siguiente_version,
            fecha_vencimiento=(
                timezone.now().date() + timedelta(days=365)
            ),
            estado='BORRADOR',
            usuario_responsable=request.user,
            observaciones=f"Copia del período {autoevaluacion.periodo}"
        )
        
        # Generar número
        nueva_autoevaluacion.numero_autoevaluacion = (
            f"AUT-{nueva_autoevaluacion.datos_prestador.codigo_reps}"
            f"-{siguiente_periodo}-v1"
        )
        nueva_autoevaluacion.save()
        
        serializer = self.get_serializer(nueva_autoevaluacion)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )


class CumplimientoViewSet(viewsets.ModelViewSet):
    """
    API para gestionar registros de cumplimiento de criterios.
    
    Acciones personalizadas:
    - GET /api/habilitacion/cumplimientos/sin_cumplir/ → No cumplen
    - GET /api/habilitacion/cumplimientos/con_plan_mejora/ → Con plan de mejora
    - GET /api/habilitacion/cumplimientos/mejoras_vencidas/ → Compromisos vencidos
    - GET /api/habilitacion/cumplimientos/servicios_de_autoevaluacion/ → Servicios filtrados
    """
    
    queryset = Cumplimiento.objects.select_related(
        'autoevaluacion',
        'servicio_sede',
        'criterio',
        'responsable_mejora'
    ).prefetch_related('documentos_evidencia')
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = [
        'autoevaluacion',
        'servicio_sede',
        'criterio',
        'cumple',
    ]
    search_fields = [
        'criterio__codigo',
        'criterio__nombre',
    ]
    ordering_fields = [
        'fecha_creacion',
        'fecha_compromiso',
    ]
    ordering = ['-fecha_actualizacion']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CumplimientoListSerializer
        return CumplimientoDetailSerializer
    
    def perform_create(self, serializer):
        """Validación adicional al crear cumplimiento."""
        # La validación principal está en el serializer
        # Pero también hacemos una verificación aquí
        autoevaluacion = serializer.validated_data.get('autoevaluacion')
        servicio_sede = serializer.validated_data.get('servicio_sede')
        
        if autoevaluacion and servicio_sede:
            if servicio_sede.prestador != autoevaluacion.datos_prestador:
                raise serializers.ValidationError({
                    'servicio_sede': [
                        f"El servicio debe pertenecer al prestador '{autoevaluacion.datos_prestador.nombre_prestador}' "
                        f"que tiene la autoevaluación seleccionada."
                    ]
                })
        
        serializer.save()
    
    @action(detail=False, methods=['get'])
    def servicios_de_autoevaluacion(self, request):
        """
        Obtiene los servicios disponibles para una autoevaluación específica.
        
        Parámetros de query:
        - autoevaluacion_id: ID de la autoevaluación (requerido)
        
        Retorna: Lista de servicios del prestador vinculado a la autoevaluación
        
        Ejemplo: GET /api/habilitacion/cumplimientos/servicios_de_autoevaluacion/?autoevaluacion_id=5
        """
        autoevaluacion_id = request.query_params.get('autoevaluacion_id')
        
        if not autoevaluacion_id:
            return Response(
                {
                    'error': 'Parámetro requerido: autoevaluacion_id',
                    'ejemplo': '/api/habilitacion/cumplimientos/servicios_de_autoevaluacion/?autoevaluacion_id=5'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            autoevaluacion = Autoevaluacion.objects.get(pk=autoevaluacion_id)
        except Autoevaluacion.DoesNotExist:
            return Response(
                {'error': f'La autoevaluación con ID {autoevaluacion_id} no existe.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Obtener servicios del prestador de la autoevaluación
        prestador = autoevaluacion.datos_prestador
        servicios = ServicioSede.objects.filter(prestador=prestador)
        
        # Serializar
        serializer = ServicioSedeListSerializer(servicios, many=True)
        
        return Response({
            'autoevaluacion': {
                'id': autoevaluacion.id,
                'numero': autoevaluacion.numero_autoevaluacion,
                'periodo': autoevaluacion.periodo,
            },
            'prestador': {
                'id': prestador.id,
                'codigo_reps': prestador.codigo_reps,
                'nombre': prestador.nombre_prestador,
            },
            'servicios': serializer.data,
            'total_servicios': servicios.count(),
        })
    
    @action(detail=False, methods=['get'])
    def sin_cumplir(self, request):
        """Criterios no cumplidos con planes de mejora."""
        queryset = self.queryset.filter(
            cumple='NO_CUMPLE'
        ).order_by('fecha_compromiso')
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = CumplimientoListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = CumplimientoListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def con_plan_mejora(self, request):
        """Cumplimientos con plan de mejora pendiente."""
        queryset = self.queryset.filter(
            plan_mejora__isnull=False
        ).exclude(plan_mejora='')
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = CumplimientoListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = CumplimientoListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def mejoras_vencidas(self, request):
        """Planes de mejora con fecha comprometida vencida."""
        hoy = timezone.now().date()
        queryset = self.queryset.filter(
            fecha_compromiso__lt=hoy,
            cumple='NO_CUMPLE'
        ).order_by('fecha_compromiso')
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = CumplimientoListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = CumplimientoListSerializer(queryset, many=True)
        return Response(serializer.data)


## -------
"""
habilitacion/serializers.py

Serializers para la API de habilitación de servicios de salud.
Incluye validaciones complejas y campos calculados.
"""

from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta

from .models import DatosPrestador, ServicioSede, Autoevaluacion, Cumplimiento
from companies.models import Company, Headquarters
from normativity.models import Criterio
from processes.models import Documento
from users.models import User


class DatosPrestadorListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listados de DatosPrestador."""
    
    company_name = serializers.CharField(
        source='headquarters.company.name',
        read_only=True
    )
    estado_display = serializers.CharField(
        source='get_estado_habilitacion_display',
        read_only=True
    )
    proxima_vencer = serializers.SerializerMethodField()
    dias_vencimiento = serializers.SerializerMethodField()
    
    class Meta:
        model = DatosPrestador
        fields = [
            'id',
            'codigo_reps',
            'company_name',
            'clase_prestador',
            'estado_habilitacion',
            'estado_display',
            'fecha_vencimiento_habilitacion',
            'proxima_vencer',
            'dias_vencimiento',
        ]
        read_only_fields = fields
    
    def get_proxima_vencer(self, obj):
        """¿Está próxima a vencer?"""
        return obj.esta_proxima_a_vencer(dias=90)
    
    def get_dias_vencimiento(self, obj):
        """Días restantes para vencimiento."""
        return obj.dias_para_vencimiento()


class DatosPrestadorDetailSerializer(serializers.ModelSerializer):
    """Serializer detallado para DatosPrestador con validaciones."""
    
    headquarters_id = serializers.PrimaryKeyRelatedField(
        queryset=Headquarters.objects.all(),
        source='headquarters',
        write_only=True
    )
    company_detail = serializers.SerializerMethodField()
    headquarters_detail = serializers.SerializerMethodField()
    clase_prestador_display = serializers.CharField(
        source='get_clase_prestador_display',
        read_only=True
    )
    estado_display = serializers.CharField(
        source='get_estado_habilitacion_display',
        read_only=True
    )
    
    # Información calculada
    dias_vencimiento = serializers.SerializerMethodField()
    proxima_vencer = serializers.SerializerMethodField()
    vencida = serializers.SerializerMethodField()
    autoevaluaciones_count = serializers.SerializerMethodField()
    
    class Meta:
        model = DatosPrestador
        fields = [
            'id',
            'codigo_reps',
            'headquarters_id',
            'company_detail',
            'headquarters_detail',
            'nombre_prestador',
            'sede_principal',
            'clase_prestador',
            'clase_prestador_display',
            'estado_habilitacion',
            'estado_display',
            'fecha_inscripcion',
            'fecha_renovacion',
            'fecha_vencimiento_habilitacion',
            'dias_vencimiento',
            'proxima_vencer',
            'vencida',
            'aseguradora_pep',
            'numero_poliza',
            'vigencia_poliza',
            'autoevaluaciones_count',
            'fecha_creacion',
            'fecha_actualizacion',
        ]
        read_only_fields = [
            'id',
            'fecha_creacion',
            'fecha_actualizacion',
            'company_detail',
            'headquarters_detail',
            'dias_vencimiento',
            'proxima_vencer',
            'vencida',
            'autoevaluaciones_count',
        ]
    
    def get_company_detail(self, obj):
        """Detalle de la company vinculada a través de headquarters."""
        company = obj.headquarters.company
        return {
            'id': company.id,
            'name': company.name,
            'nit': getattr(company, 'nit', None),
        }

    def get_headquarters_detail(self, obj):
        """Detalle de la sede (headquarters) vinculada al prestador."""
        hq = obj.headquarters
        return {
            'id': hq.id,
            'name': hq.name,
            'habilitationCode': hq.habilitationCode,
        }
    
    def get_dias_vencimiento(self, obj):
        return obj.dias_para_vencimiento()
    
    def get_proxima_vencer(self, obj):
        return obj.esta_proxima_a_vencer(dias=90)
    
    def get_vencida(self, obj):
        return obj.esta_vencida()
    
    def get_autoevaluaciones_count(self, obj):
        return obj.autoevaluaciones.count()
    
    def validate_codigo_reps(self, value):
        """Validar formato del código REPS."""
        if not value or len(value) < 5:
            raise serializers.ValidationError(
                "El código REPS debe tener al menos 5 caracteres."
            )
        return value


class ServicioSedeListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listados de ServicioSede."""
    
    prestador_codigo = serializers.CharField(
        source='prestador.codigo_reps',
        read_only=True
    )
    prestador_headquarters = serializers.CharField(
        source='prestador.headquarters.name',
        read_only=True
    )
    modalidad_display = serializers.CharField(
        source='get_modalidad_display',
        read_only=True
    )
    complejidad_display = serializers.CharField(
        source='get_complejidad_display',
        read_only=True
    )
    estado_display = serializers.CharField(
        source='get_estado_habilitacion_display',
        read_only=True
    )
    vencido = serializers.SerializerMethodField()
    
    class Meta:
        model = ServicioSede
        fields = [
            'id',
            'codigo_servicio',
            'nombre_servicio',
            'prestador_codigo',
            'prestador_headquarters',
            'modalidad',
            'modalidad_display',
            'complejidad',
            'complejidad_display',
            'estado_habilitacion',
            'estado_display',
            'fecha_vencimiento',
            'vencido',
        ]
        read_only_fields = fields
    
    def get_vencido(self, obj):
        return obj.esta_vencido()


class ServicioSedeDetailSerializer(serializers.ModelSerializer):
    """Serializer detallado para ServicioSede."""
    
    prestador_id = serializers.PrimaryKeyRelatedField(
        queryset=DatosPrestador.objects.all(),
        source='prestador',
        write_only=True
    )
    prestador_detail = serializers.SerializerMethodField()
    modalidad_display = serializers.CharField(
        source='get_modalidad_display',
        read_only=True
    )
    complejidad_display = serializers.CharField(
        source='get_complejidad_display',
        read_only=True
    )
    estado_display = serializers.CharField(
        source='get_estado_habilitacion_display',
        read_only=True
    )
    vencido = serializers.SerializerMethodField()
    dias_vencimiento = serializers.SerializerMethodField()
    
    class Meta:
        model = ServicioSede
        fields = [
            'id',
            'codigo_servicio',
            'nombre_servicio',
            'descripcion',
            'prestador_id',
            'prestador_detail',
            'modalidad',
            'modalidad_display',
            'complejidad',
            'complejidad_display',
            'estado_habilitacion',
            'estado_display',
            'fecha_habilitacion',
            'fecha_vencimiento',
            'vencido',
            'dias_vencimiento',
            'fecha_creacion',
            'fecha_actualizacion',
        ]
        read_only_fields = [
            'id',
            'fecha_creacion',
            'fecha_actualizacion',
            'prestador_detail',
            'vencido',
            'dias_vencimiento',
        ]
    
    def get_prestador_detail(self, obj):
        return {
            'id': obj.prestador.id,
            'codigo_reps': obj.prestador.codigo_reps,
            'nombre_prestador': obj.prestador.nombre_prestador,
            'headquarters': obj.prestador.headquarters.name,
            'estado_habilitacion': obj.prestador.get_estado_habilitacion_display(),
        }
    
    def get_vencido(self, obj):
        return obj.esta_vencido()
    
    def get_dias_vencimiento(self, obj):
        return obj.dias_para_vencimiento()


class AutoevaluacionListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listados de Autoevaluacion."""
    
    prestador_codigo = serializers.CharField(
        source='datos_prestador.codigo_reps',
        read_only=True
    )
    estado_display = serializers.CharField(
        source='get_estado_display',
        read_only=True
    )
    porcentaje_cumplimiento = serializers.SerializerMethodField()
    
    class Meta:
        model = Autoevaluacion
        fields = [
            'id',
            'numero_autoevaluacion',
            'prestador_codigo',
            'periodo',
            'version',
            'estado',
            'estado_display',
            'fecha_inicio',
            'fecha_completacion',
            'porcentaje_cumplimiento',
        ]
        read_only_fields = fields
    
    def get_porcentaje_cumplimiento(self, obj):
        return round(obj.porcentaje_cumplimiento(), 2)


class AutoevaluacionDetailSerializer(serializers.ModelSerializer):
    """Serializer detallado para Autoevaluacion."""
    
    datos_prestador_id = serializers.PrimaryKeyRelatedField(
        queryset=DatosPrestador.objects.all(),
        source='datos_prestador',
        write_only=True
    )
    datos_prestador_detail = serializers.SerializerMethodField()
    usuario_responsable_detail = serializers.SerializerMethodField()
    estado_display = serializers.CharField(
        source='get_estado_display',
        read_only=True
    )
    porcentaje_cumplimiento = serializers.SerializerMethodField()
    vigente = serializers.SerializerMethodField()
    total_cumplimientos = serializers.SerializerMethodField()
    cumplimientos_data = serializers.SerializerMethodField()

    # ─── Integración con app mejoras ───
    planes_mejora_count = serializers.SerializerMethodField()
    hallazgos_count = serializers.SerializerMethodField()
    mejoras_resumen = serializers.SerializerMethodField()
    
    class Meta:
        model = Autoevaluacion
        fields = [
            'id',
            'numero_autoevaluacion',
            'datos_prestador_id',
            'datos_prestador_detail',
            'periodo',
            'version',
            'estado',
            'estado_display',
            'fecha_inicio',
            'fecha_completacion',
            'fecha_vencimiento',
            'vigente',
            'usuario_responsable_detail',
            'observaciones',
            'porcentaje_cumplimiento',
            'total_cumplimientos',
            'cumplimientos_data',
            'planes_mejora_count',
            'hallazgos_count',
            'mejoras_resumen',
            'fecha_creacion',
            'fecha_actualizacion',
        ]
        read_only_fields = [
            'id',
            'fecha_creacion',
            'fecha_actualizacion',
            'numero_autoevaluacion',
            'datos_prestador_detail',
            'usuario_responsable_detail',
            'porcentaje_cumplimiento',
            'vigente',
            'total_cumplimientos',
            'cumplimientos_data',
            'planes_mejora_count',
            'hallazgos_count',
            'mejoras_resumen',
        ]
    
    def get_datos_prestador_detail(self, obj):
        return {
            'id': obj.datos_prestador.id,
            'nombre_prestador': obj.datos_prestador.nombre_prestador,
            'codigo_reps': obj.datos_prestador.codigo_reps,
            'company_name': obj.datos_prestador.headquarters.company.name,
        }
    
    def get_usuario_responsable_detail(self, obj):
        if not obj.usuario_responsable:
            return None
        return {
            'id': obj.usuario_responsable.id,
            'username': obj.usuario_responsable.username,
            'email': obj.usuario_responsable.email,
        }
    
    def get_porcentaje_cumplimiento(self, obj):
        return round(obj.porcentaje_cumplimiento(), 2)
    
    def get_vigente(self, obj):
        return obj.esta_vigente()
    
    def get_total_cumplimientos(self, obj):
        return obj.cumplimientos.count()
    
    def get_cumplimientos_data(self, obj):
        """Resumen de cumplimientos por estado."""
        cumplimientos = obj.cumplimientos.all()
        return {
            'total': cumplimientos.count(),
            'cumple': cumplimientos.filter(cumple='CUMPLE').count(),
            'no_cumple': cumplimientos.filter(cumple='NO_CUMPLE').count(),
            'parcialmente': cumplimientos.filter(cumple='PARCIALMENTE').count(),
            'no_aplica': cumplimientos.filter(cumple='NO_APLICA').count(),
        }

    def get_planes_mejora_count(self, obj):
        """Total de planes de mejora vinculados a esta autoevaluación."""
        from mejoras.models import PlanMejora
        return PlanMejora.objects.filter(autoevaluacion=obj).count()

    def get_hallazgos_count(self, obj):
        """Total de hallazgos vinculados a esta autoevaluación."""
        from mejoras.models import Hallazgo
        return Hallazgo.objects.filter(autoevaluacion=obj).count()

    def get_mejoras_resumen(self, obj):
        """Resumen de planes de mejora y hallazgos para esta autoevaluación."""
        from mejoras.models import PlanMejora, Hallazgo
        planes = PlanMejora.objects.filter(autoevaluacion=obj)
        hallazgos = Hallazgo.objects.filter(autoevaluacion=obj)
        return {
            'total_planes': planes.count(),
            'planes_pendientes': planes.filter(estado='PENDIENTE').count(),
            'planes_en_curso': planes.filter(estado='EN_CURSO').count(),
            'planes_completados': planes.filter(estado='COMPLETADO').count(),
            'total_hallazgos': hallazgos.count(),
            'hallazgos_abiertos': hallazgos.filter(estado='ABIERTO').count(),
            'hallazgos_cerrados': hallazgos.filter(estado='CERRADO').count(),
        }


class CumplimientoListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listados de Cumplimiento."""
    
    criterio_codigo = serializers.CharField(
        source='criterio.codigo',
        read_only=True
    )
    criterio_nombre = serializers.CharField(
        source='criterio.nombre',
        read_only=True
    )
    servicio_nombre = serializers.CharField(
        source='servicio_sede.nombre_servicio',
        read_only=True
    )
    cumple_display = serializers.CharField(
        source='get_cumple_display',
        read_only=True
    )
    documentos_evidencia = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Documento.objects.filter(estado='VIGENTE'),
        required=False
    )
    documentos_evidencia_list = serializers.SerializerMethodField(read_only=True)
    tiene_plan_mejora = serializers.SerializerMethodField()
    planes_mejora_count = serializers.SerializerMethodField()
    hallazgos_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Cumplimiento
        fields = [
            'id',
            'criterio_codigo',
            'criterio_nombre',
            'servicio_nombre',
            "autoevaluacion_id",  
            "servicio_sede_id",
            "criterio_id",
            'cumple',
            'cumple_display',
            "documentos_evidencia",      # writable (entrada)
            "documentos_evidencia_list", # read-only (salida)
            'tiene_plan_mejora',
            'planes_mejora_count',
            'hallazgos_count',
            'fecha_compromiso',
        ]
        read_only_fields = fields
    
    def get_tiene_plan_mejora(self, obj):
        """Verifica si tiene planes de mejora en la app mejoras."""
        if hasattr(obj, 'planes_mejora') and obj.planes_mejora.exists():
            return True
        # Fallback al campo TextField antiguo
        return bool(obj.plan_mejora)

    def get_planes_mejora_count(self, obj):
        """Cantidad de planes de mejora vinculados (app mejoras)."""
        if hasattr(obj, 'planes_mejora'):
            return obj.planes_mejora.count()
        return 0

    def get_hallazgos_count(self, obj):
        """Cantidad de hallazgos vinculados a la autoevaluación + criterio."""
        from mejoras.models import Hallazgo
        return Hallazgo.objects.filter(
            autoevaluacion=obj.autoevaluacion,
            criterio=obj.criterio
        ).count()
    
    def get_documentos_evidencia_list(self, obj):
        """Lista de documentos de evidencia con detalles."""
        documentos = obj.documentos_evidencia.all()
        return [
            {
                'id': doc.id,
                'titulo': doc.nombre_documento,
                'tipo': doc.tipo_documento,
                'archivo': str(doc.archivo_oficial) if doc.archivo_oficial else None,
            }
            for doc in documentos
        ]


class CumplimientoDetailSerializer(serializers.ModelSerializer):
    """Serializer detallado para Cumplimiento."""
    
    autoevaluacion_id = serializers.PrimaryKeyRelatedField(
        queryset=Autoevaluacion.objects.all(),
        source='autoevaluacion',
        write_only=True
    )
    servicio_sede_id = serializers.PrimaryKeyRelatedField(
        queryset=ServicioSede.objects.all(),
        source='servicio_sede',
        write_only=True
    )
    criterio_id = serializers.PrimaryKeyRelatedField(
        queryset=Criterio.objects.all(),
        source='criterio',
        write_only=True
    )
    
    # Servicios disponibles para la autoevaluación seleccionada (lectura)
    servicios_disponibles = serializers.SerializerMethodField()
    
    # Details (lectura)
    autoevaluacion_detail = serializers.SerializerMethodField()
    servicio_sede_detail = serializers.SerializerMethodField()
    criterio_detail = serializers.SerializerMethodField()
    documentos_evidencia_list = serializers.SerializerMethodField()
    responsable_mejora_detail = serializers.SerializerMethodField()
    
    cumple_display = serializers.CharField(
        source='get_cumple_display',
        read_only=True
    )
    tiene_plan_mejora = serializers.SerializerMethodField()
    mejora_vencida = serializers.SerializerMethodField()

    # ─── Integración con app mejoras ───
    planes_mejora_vinculados = serializers.SerializerMethodField()
    hallazgos_vinculados = serializers.SerializerMethodField()
    
    class Meta:
        model = Cumplimiento
        fields = [
            'id',
            'autoevaluacion_id',
            'autoevaluacion_detail',
            'servicio_sede_id',
            'servicio_sede_detail',
            'servicios_disponibles',
            'criterio_id',
            'criterio_detail',
            'cumple',
            'cumple_display',
            'hallazgo',
            'plan_mejora',
            'responsable_mejora_detail',
            'fecha_compromiso',
            'tiene_plan_mejora',
            'mejora_vencida',
            'planes_mejora_vinculados',
            'hallazgos_vinculados',
            'documentos_evidencia_list',
            'fecha_creacion',
            'fecha_actualizacion',
        ]
        read_only_fields = [
            'id',
            'fecha_creacion',
            'fecha_actualizacion',
            'autoevaluacion_detail',
            'servicio_sede_detail',
            'criterio_detail',
            'documentos_evidencia_list',
            'responsable_mejora_detail',
            'tiene_plan_mejora',
            'mejora_vencida',
            'planes_mejora_vinculados',
            'hallazgos_vinculados',
            'servicios_disponibles',
        ]
    
    def get_autoevaluacion_detail(self, obj):
        return {
            'id': obj.autoevaluacion.id,
            'numero': obj.autoevaluacion.numero_autoevaluacion,
            'periodo': obj.autoevaluacion.periodo,
        }
    
    def get_servicio_sede_detail(self, obj):
        return {
            'id': obj.servicio_sede.id,
            'codigo': obj.servicio_sede.codigo_servicio,
            'nombre': obj.servicio_sede.nombre_servicio,
        }
    
    def get_criterio_detail(self, obj):
        return {
            'id': obj.criterio.id,
            'codigo': obj.criterio.codigo,
            'nombre': obj.criterio.nombre,
            'complejidad': obj.criterio.complejidad,
        }
    
    def get_documentos_evidencia_list(self, obj):
        documentos = obj.documentos_evidencia.all()
        return [
            {
                'id': doc.id,
                'titulo': doc.nombre_documento,
                'tipo': doc.tipo_documento,
                'archivo': str(doc.archivo_oficial) if doc.archivo_oficial else None,
            }
            for doc in documentos
        ]
    
    def get_responsable_mejora_detail(self, obj):
        if not obj.responsable_mejora:
            return None
        return {
            'id': obj.responsable_mejora.id,
            'username': obj.responsable_mejora.username,
            'email': obj.responsable_mejora.email,
        }
    
    def get_tiene_plan_mejora(self, obj):
        """Verifica si tiene planes de mejora vinculados (app mejoras o campo legacy)."""
        if hasattr(obj, 'planes_mejora') and obj.planes_mejora.exists():
            return True
        return bool(obj.plan_mejora)
    
    def get_mejora_vencida(self, obj):
        return obj.mejora_vencida()

    def get_planes_mejora_vinculados(self, obj):
        """Lista de planes de mejora vinculados (app mejoras)."""
        if hasattr(obj, 'planes_mejora'):
            planes = obj.planes_mejora.all()
            return [
                {
                    'id': p.id,
                    'numero_plan': p.numero_plan,
                    'estado': p.estado,
                    'porcentaje_avance': p.porcentaje_avance,
                    'fecha_vencimiento': p.fecha_vencimiento,
                    'esta_vencido': p.esta_vencido,
                }
                for p in planes
            ]
        return []

    def get_servicios_disponibles(self, obj):
        """
        Retorna los servicios disponibles para la autoevaluación.
        Útil para que el frontend sepa qué servicios puede seleccionar.
        Robustez: Soporta tanto updates (obj existe) como context del request.
        """
        # Opción 1: Si el objeto existe, usar sus datos
        if obj and obj.autoevaluacion:
            prestador = obj.autoevaluacion.datos_prestador
        # Opción 2: Desde el contexto (durante POST/PUT)
        elif 'autoevaluacion_id' in self.initial_data:
            try:
                autoevaluacion_id = self.initial_data.get('autoevaluacion_id')
                autoevaluacion = Autoevaluacion.objects.get(pk=autoevaluacion_id)
                prestador = autoevaluacion.datos_prestador
            except (Autoevaluacion.DoesNotExist, ValueError):
                return []
        else:
            return []
        
        servicios = ServicioSede.objects.filter(
            prestador=prestador
        ).select_related('prestador')
        
        return [
            {
                'id': s.id,
                'codigo': s.codigo_servicio,
                'nombre': s.nombre_servicio,
                'modalidad': s.get_modalidad_display(),
                'complejidad': s.get_complejidad_display(),
                'estado': s.get_estado_habilitacion_display(),
            }
            for s in servicios
        ]
    
    def validate_servicio_sede_id(self, value):
        """
        Validar que el servicio pertenezca al prestador de la autoevaluación.
        Se ejecuta cuando se actualiza/crea un cumplimiento.
        Con mensajes de error descriptivos.
        """
        # Solo validar si estamos en create/update
        if self.instance is None or self.partial:
            # Obtener la autoevaluación del contexto
            autoevaluacion_id = self.initial_data.get('autoevaluacion_id')
            
            if autoevaluacion_id:
                try:
                    autoevaluacion_obj = Autoevaluacion.objects.get(pk=autoevaluacion_id)
                    prestador = autoevaluacion_obj.datos_prestador
                    
                    # Verificar que el servicio pertenezca a este prestador
                    if value.prestador != prestador:
                        # Obtener servicios disponibles para sugerir
                        servicios_disponibles = ServicioSede.objects.filter(
                            prestador=prestador
                        ).values_list('nombre_servicio', flat=True)
                        
                        msg = (
                            f"El servicio '{value.nombre_servicio}' pertenece al prestador "
                            f"'{value.prestador.nombre_prestador}', pero la autoevaluación "
                            f"es del prestador '{prestador.nombre_prestador}'. "
                        )
                        
                        if servicios_disponibles:
                            msg += f"Servicios disponibles: {', '.join(servicios_disponibles)}"
                        else:
                            msg += (
                                f"⚠️ No hay servicios registrados para '{prestador.nombre_prestador}'. "
                                f"Registre servicios antes de crear cumplimientos."
                            )
                        
                        raise serializers.ValidationError(msg)
                        
                except Autoevaluacion.DoesNotExist:
                    raise serializers.ValidationError(
                        "La autoevaluación especificada no existe."
                    )
        
        return value

    def get_hallazgos_vinculados(self, obj):
        """Lista de hallazgos vinculados (app mejoras) por autoevaluacion + criterio."""
        from mejoras.models import Hallazgo
        hallazgos = Hallazgo.objects.filter(
            autoevaluacion=obj.autoevaluacion,
            criterio=obj.criterio
        )
        return [
            {
                'id': h.id,
                'numero_hallazgo': h.numero_hallazgo,
                'tipo': h.tipo,
                'severidad': h.severidad,
                'estado': h.estado,
                'tiene_plan': h.plan_mejora_id is not None,
            }
            for h in hallazgos
        ]


## -------
"""
habilitacion/admin.py

Administración avanzada para habilitación de servicios de salud.
Incluye validaciones, visualizaciones coloridas y acciones en lote.
"""

from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.db.models import Count
from django.utils import timezone

from .models import DatosPrestador, ServicioSede, Autoevaluacion, Cumplimiento


# ============================================================================
# COLORES Y UTILIDADES
# ============================================================================

ESTADO_HABILITACION_COLORS = {
    'HABILITADA': '#28a745',      # Verde
    'EN_PROCESO': '#ffc107',       # Amarillo
    'SUSPENDIDA': '#dc3545',       # Rojo
    'NO_HABILITADA': '#6c757d',    # Gris
    'CANCELADA': '#000000',         # Negro
}

ESTADO_SERVICIO_COLORS = {
    'HABILITADO': '#28a745',       # Verde
    'EN_PROCESO': '#ffc107',       # Amarillo
    'SUSPENDIDO': '#dc3545',       # Rojo
    'NO_HABILITADO': '#6c757d',    # Gris
    'CANCELADO': '#000000',         # Negro
}

ESTADO_AUTOEVALUACION_COLORS = {
    'BORRADOR': '#6c757d',         # Gris
    'EN_CURSO': '#17a2b8',         # Azul
    'COMPLETADA': '#28a745',       # Verde
    'REVISADA': '#ffc107',         # Amarillo
    'VALIDADA': '#007bff',         # Azul Oscuro
}

CUMPLIMIENTO_COLORS = {
    'CUMPLE': '#28a745',           # Verde
    'NO_CUMPLE': '#dc3545',        # Rojo
    'PARCIALMENTE': '#ffc107',     # Amarillo
    'NO_APLICA': '#6c757d',        # Gris
}

COMPLEJIDAD_COLORS = {
    'BAJA': '#28a745',             # Verde
    'MEDIA': '#ffc107',            # Amarillo
    'ALTA': '#dc3545',             # Rojo
}


def colored_badge(value, color_dict, text=None):
    """Crear un badge coloreado HTML."""
    if value not in color_dict:
        return value
    color = color_dict[value]
    display_text = text or value
    return format_html(
        '<span style="background-color: {}; color: white; padding: 4px 8px; '
        'border-radius: 4px; font-weight: bold;">{}</span>',
        color,
        display_text
    )


# ============================================================================
# ADMIN: DatosPrestador
# ============================================================================

@admin.register(DatosPrestador)
class DatosPrestadorAdmin(admin.ModelAdmin):
    """Administración de datos de prestadores habilitados."""
    
    list_display = [
        'codigo_reps_link',
        'nombre_prestador',
        'sede_principal',
        'headquarters_link',
        'clase_prestador_badge',
        'estado_habilitacion_badge',
        'vencimiento_status',
        'poliza_icon',
        'fecha_creacion',
    ]
    
    list_filter = [
        'estado_habilitacion',
        'clase_prestador',
        'fecha_vencimiento_habilitacion',
    ]
    
    search_fields = [
        'codigo_reps',
        'headquarters__nombre',
        'aseguradora_pep',
    ]
    
    readonly_fields = [
        'fecha_creacion',
        'fecha_actualizacion',
        'dias_para_vencimiento_display',
        'estado_actual_display',
    ]
    
    fieldsets = (
        ('Identificación REPS', {
            'fields': (
                'headquarters',
                'codigo_reps',
                'nombre_prestador',
                'sede_principal',
                'clase_prestador',
            )
        }),
        ('Estado de Habilitación', {
            'fields': (
                'estado_habilitacion',
                'estado_actual_display',
                'fecha_inscripcion',
                'fecha_renovacion',
                'fecha_vencimiento_habilitacion',
                'dias_para_vencimiento_display',
            )
        }),
        ('Responsabilidad Civil', {
            'fields': (
                'aseguradora_pep',
                'numero_poliza',
                'vigencia_poliza',
            )
        }),
        ('Auditoría', {
            'fields': (
                'usuario_responsable',
                'fecha_creacion',
                'fecha_actualizacion',
            ),
            'classes': ('collapse',),
        }),
    )
    
    def codigo_reps_link(self, obj):
        """Link al código REPS con color."""
        return format_html(
            '<a href="{}">{}</a>',
            reverse('admin:habilitacion_datosprestador_change', args=[obj.pk]),
            obj.codigo_reps
        )
    codigo_reps_link.short_description = 'Código REPS'
    
    def headquarters_link(self, obj):
        """Link a la sede."""
        url = reverse('admin:companies_headquarters_change', args=[obj.headquarters.pk])
        return format_html('<a href="{}">{}</a>', url, obj.headquarters.name)
    headquarters_link.short_description = 'Sede (Headquarters)'
    
    def clase_prestador_badge(self, obj):
        """Badge de clase de prestador."""
        colors = {
            'IPS': '#007bff',
            'PROF': '#28a745',
            'PH': '#17a2b8',
            'PJ': '#6c757d',
        }
        return colored_badge(obj.clase_prestador, colors)
    clase_prestador_badge.short_description = 'Clase'
    
    def estado_habilitacion_badge(self, obj):
        """Badge del estado de habilitación."""
        return colored_badge(
            obj.estado_habilitacion,
            ESTADO_HABILITACION_COLORS
        )
    estado_habilitacion_badge.short_description = 'Estado'
    
    def vencimiento_status(self, obj):
        """Indicador visual de vencimiento."""
        if obj.esta_vencida():
            return colored_badge('VENCIDA', {'VENCIDA': '#dc3545'})
        elif obj.esta_proxima_a_vencer(dias=90):
            return colored_badge('PRÓXIMA A VENCER', {'PRÓXIMA A VENCER': '#ffc107'})
        else:
            return colored_badge('VIGENTE', {'VIGENTE': '#28a745'})
    vencimiento_status.short_description = 'Vigencia'
    
    def poliza_icon(self, obj):
        """Icono indicando si tiene póliza vigente."""
        if obj.vigencia_poliza and obj.vigencia_poliza > timezone.now().date():
            return format_html(
                '<span style="color: #28a745; font-size: 18px;">✓</span>'
            )
        return format_html(
            '<span style="color: #dc3545; font-size: 18px;">✗</span>'
        )
    poliza_icon.short_description = 'Póliza'
    
    def dias_para_vencimiento_display(self, obj):
        """Días para vencimiento (readonly)."""
        dias = obj.dias_para_vencimiento()
        if dias is None:
            return '—'
        return f"{dias} días"
    dias_para_vencimiento_display.short_description = 'Días para Vencimiento'
    
    def estado_actual_display(self, obj):
        """Descripción detallada del estado."""
        if obj.esta_vencida():
            return 'VENCIDA'
        elif obj.esta_proxima_a_vencer(dias=90):
            dias = obj.dias_para_vencimiento()
            return f'Próxima a vencer en {dias} días'
        else:
            dias = obj.dias_para_vencimiento()
            return f'Vigente ({dias} días)'
    estado_actual_display.short_description = 'Estado Actual'


# ============================================================================
# ADMIN: ServicioSede
# ============================================================================

@admin.register(ServicioSede)
class ServicioSedeAdmin(admin.ModelAdmin):
    """Administración de servicios de salud por sede."""
    
    list_display = [
        'codigo_servicio_link',
        'prestador_link',
        'modalidad_badge',
        'complejidad_badge',
        'estado_habilitacion_badge',
        'fecha_vencimiento_display',
        'cumplimientos_count',
    ]
    
    list_filter = [
        'modalidad',
        'complejidad',
        'estado_habilitacion',
        'prestador',
    ]
    
    search_fields = [
        'codigo_servicio',
        'nombre_servicio',
        'prestador__codigo_reps',
    ]
    
    readonly_fields = [
        'fecha_creacion',
        'fecha_actualizacion',
        'vencimiento_display',
        'cumplimientos_count',
    ]
    
    fieldsets = (
        ('Identificación', {
            'fields': (
                'prestador',
                'codigo_servicio',
                'nombre_servicio',
                'descripcion',
            )
        }),
        ('Clasificación', {
            'fields': (
                'modalidad',
                'complejidad',
            )
        }),
        ('Habilitación', {
            'fields': (
                'estado_habilitacion',
                'fecha_habilitacion',
                'fecha_vencimiento',
                'vencimiento_display',
            )
        }),
        ('Auditoría', {
            'fields': (
                'fecha_creacion',
                'fecha_actualizacion',
                'cumplimientos_count',
            ),
            'classes': ('collapse',),
        }),
    )
    
    def codigo_servicio_link(self, obj):
        """Link al código con color."""
        return format_html(
            '<a href="{}">{}</a>',
            reverse('admin:habilitacion_serviciosede_change', args=[obj.pk]),
            obj.codigo_servicio
        )
    codigo_servicio_link.short_description = 'Código'
    
    def prestador_link(self, obj):
        """Link al prestador."""
        url = reverse('admin:habilitacion_datosprestador_change', args=[obj.prestador.pk])
        return format_html('<a href="{}">{}</a>', url, obj.prestador)
    prestador_link.short_description = 'Prestador'
    
    def modalidad_badge(self, obj):
        """Badge de modalidad."""
        colors = {
            'INTRAMURAL': '#007bff',
            'AMBULATORIA': '#28a745',
            'TELEMEDICINA': '#17a2b8',
            'URGENCIAS': '#dc3545',
            'AMBULANCIA': '#6c757d',
        }
        return colored_badge(obj.modalidad, colors)
    modalidad_badge.short_description = 'Modalidad'
    
    def complejidad_badge(self, obj):
        """Badge de complejidad."""
        return colored_badge(obj.complejidad, COMPLEJIDAD_COLORS)
    complejidad_badge.short_description = 'Complejidad'
    
    def estado_habilitacion_badge(self, obj):
        """Badge del estado."""
        return colored_badge(
            obj.estado_habilitacion,
            ESTADO_SERVICIO_COLORS
        )
    estado_habilitacion_badge.short_description = 'Estado'
    
    def fecha_vencimiento_display(self, obj):
        """Mostrar vencimiento con código de color."""
        if not obj.fecha_vencimiento:
            return '—'
        if obj.esta_vencido():
            return colored_badge('VENCIDO', {'VENCIDO': '#dc3545'})
        dias = obj.dias_para_vencimiento()
        if dias <= 90:
            return colored_badge(
                f'{dias} días',
                {'temp': '#ffc107'}
            )
        return colored_badge(f'{dias} días', {'temp': '#28a745'})
    fecha_vencimiento_display.short_description = 'Vencimiento'
    
    def vencimiento_display(self, obj):
        """Información detallada de vencimiento."""
        if not obj.fecha_vencimiento:
            return 'No establecida'
        if obj.esta_vencido():
            return 'VENCIDA'
        dias = obj.dias_para_vencimiento()
        return f'Vigente ({dias} días)'
    vencimiento_display.short_description = 'Estado de Vencimiento'
    
    def cumplimientos_count(self, obj):
        """Cantidad de cumplimientos evaluados."""
        count = obj.cumplimientos.count()
        url = reverse('admin:habilitacion_cumplimiento_changelist')
        return format_html(
            '<a href="{}?servicio_sede__id__exact={}">{} evaluaciones</a>',
            url,
            obj.pk,
            count
        )
    cumplimientos_count.short_description = 'Evaluaciones'


# ============================================================================
# ADMIN: Autoevaluacion
# ============================================================================

@admin.register(Autoevaluacion)
class AutoevaluacionAdmin(admin.ModelAdmin):
    """Administración de autoevaluaciones anuales."""
    
    list_display = [
        'numero_autoevaluacion_link',
        'prestador_codigo',
        'periodo',
        'version',
        'estado_badge',
        'porcentaje_cumplimiento_bar',
        'usuario_responsable',
        'fecha_vencimiento_display',
    ]
    
    list_filter = [
        'estado',
        'periodo',
        'version',
        'datos_prestador__codigo_reps',
    ]
    
    search_fields = [
        'numero_autoevaluacion',
        'datos_prestador__codigo_reps',
    ]
    
    readonly_fields = [
        'numero_autoevaluacion',
        'fecha_inicio_display',
        'fecha_creacion',
        'fecha_actualizacion',
        'porcentaje_cumplimiento_display',
        'cumplimientos_resumen',
        'vigencia_display',
    ]
    
    fieldsets = (
        ('Identificación', {
            'fields': (
                'numero_autoevaluacion',
                'datos_prestador',
                'periodo',
                'version',
            )
        }),
        ('Estado (Editable)', {
            'fields': (
                'estado',
                'fecha_completacion',
                'fecha_vencimiento',
            )
        }),
        ('Resultados', {
            'fields': (
                'porcentaje_cumplimiento_display',
                'cumplimientos_resumen',
            )
        }),
        ('Notas', {
            'fields': (
                'observaciones',
            )
        }),
        ('Sistema (Solo Lectura)', {
            'fields': (
                'fecha_inicio_display',
                'vigencia_display',
                'usuario_responsable',
                'fecha_creacion',
                'fecha_actualizacion',
            ),
            'classes': ('collapse',),
        }),
    )
    
    def numero_autoevaluacion_link(self, obj):
        """Link con número de autoevaluación."""
        return format_html(
            '<a href="{}">{}</a>',
            reverse('admin:habilitacion_autoevaluacion_change', args=[obj.pk]),
            obj.numero_autoevaluacion
        )
    numero_autoevaluacion_link.short_description = 'Autoevaluación'
    
    def prestador_codigo(self, obj):
        """Código REPS del prestador."""
        url = reverse(
            'admin:habilitacion_datosprestador_change',
            args=[obj.datos_prestador.pk]
        )
        return format_html(
            '<a href="{}">{}</a>',
            url,
            obj.datos_prestador.codigo_reps
        )
    prestador_codigo.short_description = 'Prestador'
    
    def estado_badge(self, obj):
        """Badge del estado."""
        return colored_badge(obj.estado, ESTADO_AUTOEVALUACION_COLORS)
    estado_badge.short_description = 'Estado'
    
    def porcentaje_cumplimiento_bar(self, obj):
        """Barra de progreso de cumplimiento."""
        porcentaje = obj.porcentaje_cumplimiento()
        
        # Determinar color
        if porcentaje >= 80:
            color = '#28a745'  # Verde
        elif porcentaje >= 60:
            color = '#ffc107'  # Amarillo
        else:
            color = '#dc3545'  # Rojo
        
        # Formatear el porcentaje ANTES de pasarlo a format_html
        porcentaje_formateado = f"{porcentaje:.1f}"
        
        return format_html(
            '<div style="background-color: #e9ecef; border-radius: 4px; '
            'overflow: hidden; width: 150px;">'
            '<div style="background-color: {}; width: {}%; height: 20px; '
            'display: flex; align-items: center; justify-content: center; '
            'color: white; font-weight: bold; font-size: 12px;">'
            '{}%</div></div>',
            color,
            int(porcentaje),
            porcentaje_formateado
        )
    porcentaje_cumplimiento_bar.short_description = 'Cumplimiento'
    
    def porcentaje_cumplimiento_display(self, obj):
        """Porcentaje de cumplimiento (readonly)."""
        return f"{obj.porcentaje_cumplimiento():.2f}%"
    porcentaje_cumplimiento_display.short_description = 'Cumplimiento (%)'
    
    def cumplimientos_resumen(self, obj):
        """Resumen de cumplimientos por estado."""
        cumplimientos = obj.cumplimientos.all()
        total = cumplimientos.count()
        
        if total == 0:
            return 'Sin evaluaciones'
        
        cumple = cumplimientos.filter(cumple='CUMPLE').count()
        no_cumple = cumplimientos.filter(cumple='NO_CUMPLE').count()
        parcialmente = cumplimientos.filter(cumple='PARCIALMENTE').count()
        no_aplica = cumplimientos.filter(cumple='NO_APLICA').count()
        
        url = reverse('admin:habilitacion_cumplimiento_changelist')
        return format_html(
            '<a href="{}?autoevaluacion__id__exact={}">'
            'Total: {} | Cumple: {} | No cumple: {} | Parcial: {} | N/A: {}'
            '</a>',
            url,
            obj.pk,
            total,
            cumple,
            no_cumple,
            parcialmente,
            no_aplica
        )
    cumplimientos_resumen.short_description = 'Resumen de Cumplimientos'
    
    def fecha_vencimiento_display(self, obj):
        """Indicador visual de vencimiento."""
        if not obj.esta_vigente():
            return colored_badge('VENCIDA', {'VENCIDA': '#dc3545'})
        return colored_badge('VIGENTE', {'VIGENTE': '#28a745'})
    fecha_vencimiento_display.short_description = 'Vigencia'
    
    def vigencia_display(self, obj):
        """Detalle de vigencia."""
        if obj.esta_vigente():
            return 'Vigente'
        return 'Vencida'
    vigencia_display.short_description = 'Estado de Vigencia'
    
    def fecha_inicio_display(self, obj):
        """Fecha de inicio (solo lectura - auto_now_add)."""
        if obj.fecha_inicio:
            return obj.fecha_inicio.strftime('%d/%m/%Y')
        return '—'
    fecha_inicio_display.short_description = 'Fecha de Inicio'


# ============================================================================
# ADMIN: Cumplimiento
# ============================================================================

@admin.register(Cumplimiento)
class CumplimientoAdmin(admin.ModelAdmin):
    """Administración de cumplimientos de criterios."""
    
    class Media:
        js = (
            'habilitacion/js/cumplimiento_admin.js',
        )
    
    list_display = [
        'id',
        'criterio_codigo_link',
        'autoevaluacion_numero',
        'servicio_nombre',
        'cumple_badge',
        'plan_mejora_icon',
        'fecha_compromiso_display',
        'responsable_mejora_user',
    ]
    
    list_filter = [
        'cumple',
        'autoevaluacion__periodo',
        'criterio__estandar',
        'responsable_mejora',
    ]
    
    search_fields = [
        'criterio__codigo',
        'criterio__nombre',
        'hallazgo',
    ]
    
    readonly_fields = [
        'fecha_creacion',
        'fecha_actualizacion',
        'criterio_detail',
        'plan_mejora_icon',
        'mejora_estado_display',
    ]
    
    fieldsets = (
        ('Evaluación', {
            'fields': (
                'autoevaluacion',
                'servicio_sede',
                'criterio',
                'criterio_detail',
            )
        }),
        ('Resultado', {
            'fields': (
                'cumple',
                'hallazgo',
            )
        }),
        ('Plan de Mejora', {
            'fields': (
                'plan_mejora',
                'responsable_mejora',
                'fecha_compromiso',
                'mejora_estado_display',
            ),
            'classes': ('wide',),
        }),
        ('Evidencia Documental', {
            'fields': (
                'documentos_evidencia',
            )
        }),
        ('Auditoría', {
            'fields': (
                'fecha_creacion',
                'fecha_actualizacion',
            ),
            'classes': ('collapse',),
        }),
    )
    
    filter_horizontal = ('documentos_evidencia',)
    
    def criterio_codigo_link(self, obj):
        """Link al criterio con código."""
        return format_html(
            '<a href="{}">Estándar {}: {}</a>',
            reverse(
                'admin:normativity_criterio_change',
                args=[obj.criterio.pk]
            ),
            obj.criterio.estandar.codigo,
            obj.criterio.codigo
        )
    criterio_codigo_link.short_description = 'Criterio'
    
    def autoevaluacion_numero(self, obj):
        """Número de autoevaluación."""
        url = reverse(
            'admin:habilitacion_autoevaluacion_change',
            args=[obj.autoevaluacion.pk]
        )
        return format_html(
            '<a href="{}">{}</a>',
            url,
            obj.autoevaluacion.numero_autoevaluacion
        )
    autoevaluacion_numero.short_description = 'Autoevaluación'
    
    def servicio_nombre(self, obj):
        """Nombre del servicio."""
        return obj.servicio_sede.nombre_servicio
    servicio_nombre.short_description = 'Servicio'
    
    def cumple_badge(self, obj):
        """Badge de resultado de cumplimiento."""
        return colored_badge(obj.cumple, CUMPLIMIENTO_COLORS)
    cumple_badge.short_description = 'Resultado'
    
    def plan_mejora_icon(self, obj):
        """Icono indicando si hay plan de mejora."""
        if obj.plan_mejora:
            return format_html(
                '<span style="color: #28a745; font-size: 18px;">✓</span>'
            )
        return format_html(
            '<span style="color: #6c757d; font-size: 18px;">—</span>'
        )
    plan_mejora_icon.short_description = 'Plan'
    
    def fecha_compromiso_display(self, obj):
        """Mostrar fecha de compromiso con código de color."""
        if not obj.fecha_compromiso:
            return '—'
        
        hoy = timezone.now().date()
        if obj.fecha_compromiso < hoy:
            return colored_badge('VENCIDA', {'VENCIDA': '#dc3545'})
        
        dias_falta = (obj.fecha_compromiso - hoy).days
        if dias_falta <= 30:
            return colored_badge(
                f'{dias_falta} días',
                {'temp': '#ffc107'}
            )
        return colored_badge(f'{dias_falta} días', {'temp': '#28a745'})
    fecha_compromiso_display.short_description = 'Compromiso'
    
    def responsable_mejora_user(self, obj):
        """Usuario responsable de la mejora."""
        if not obj.responsable_mejora:
            return '—'
        return obj.responsable_mejora.username
    responsable_mejora_user.short_description = 'Responsable'
    
    def criterio_detail(self, obj):
        """Detalle del criterio (readonly)."""
        return format_html(
            '<strong>{}</strong> - {} <br/>'
            '<em>Complejidad: {} | Mandatorio: {} | Evidencia: {}</em>',
            obj.criterio.codigo,
            obj.criterio.nombre,
            obj.criterio.get_complejidad_display(),
            '✓' if obj.criterio.es_mandatorio else '✗',
            '✓' if obj.criterio.requiere_evidencia_documental else '✗',
        )
    criterio_detail.short_description = 'Detalle del Criterio'
    
    def mejora_estado_display(self, obj):
        """Estado de la mejora."""
        if not obj.plan_mejora:
            return 'Sin plan de mejora'
        
        if obj.cumple == 'CUMPLE':
            return 'Mejora completada'
        
        if obj.mejora_vencida():
            return 'Plazo vencido'
        
        dias_falta = (obj.fecha_compromiso - timezone.now().date()).days
        return f'Pendiente ({dias_falta} días)'
    mejora_estado_display.short_description = 'Estado de Mejora'
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        """
        Filtrado inicial de campos relacionados (servidor).
        
        NOTA: El filtrado DINÁMICO se maneja con JavaScript (cumplimiento_admin.js)
        cuando el usuario interactúa con el formulario en el navegador.
        
        Este método solo proporciona pre-filtrado al cargar la página:
        - En EDIT: Muestra solo servicios del prestador actual
        - En ADD con parámetros GET: Filtra si viene autoevaluacion_id en URL
        """
        if db_field.name == 'servicio_sede':
            # Obtener la autoevaluación seleccionada
            prestador = None
            
            # Modo EDIT: obtener del cumplimiento existente
            if request.resolver_match.kwargs:
                cumplimiento_id = request.resolver_match.kwargs.get('object_id')
                if cumplimiento_id:
                    try:
                        cumplimiento = Cumplimiento.objects.get(pk=cumplimiento_id)
                        prestador = cumplimiento.autoevaluacion.datos_prestador
                    except Cumplimiento.DoesNotExist:
                        pass
            
            # Modo ADD: obtener de parámetros GET
            if not prestador:
                autoevaluacion_id = request.GET.get('autoevaluacion')
                if autoevaluacion_id:
                    try:
                        autoevaluacion = Autoevaluacion.objects.get(pk=autoevaluacion_id)
                        prestador = autoevaluacion.datos_prestador
                    except Autoevaluacion.DoesNotExist:
                        pass
            
            # Aplicar filtro si se encontró un prestador
            if prestador:
                kwargs['queryset'] = ServicioSede.objects.filter(
                    prestador=prestador
                ).order_by('codigo_servicio')
        
        return super().formfield_for_foreignkey(db_field, request, **kwargs)
    
    def changeform_view(self, request, object_id=None, form_url='', extra_context=None):
        """
        Hook para agregar contexto personalizado en el formulario.
        Inyecta información útil para el usuario.
        """
        if extra_context is None:
            extra_context = {}
        
        if object_id is None:  # Add form (nuevo cumplimiento)
            extra_context['title'] = 'Crear nuevo Cumplimiento'
            extra_context['help_messages'] = [
                'Selecciona una Autoevaluación primero.',
                'El dropdown de Servicios se actualizará automáticamente',
                'para mostrar solo los servicios del prestador seleccionado.'
            ]
        
        return super().changeform_view(request, object_id, form_url, extra_context)


## -----
"""
habilitacion/urls.py

Rutas API para habilitación de servicios de salud.
Utiliza DefaultRouter de DRF para registro automático de ViewSets.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    DatosPrestadorViewSet,
    ServicioSedeViewSet,
    AutoevaluacionViewSet,
    CumplimientoViewSet,
)

# Crear router y registrar viewsets
router = DefaultRouter()
router.register(r'prestadores', DatosPrestadorViewSet, basename='datosprestador')
router.register(r'servicios', ServicioSedeViewSet, basename='serviciosede')
router.register(r'autoevaluaciones', AutoevaluacionViewSet, basename='autoevaluacion')
router.register(r'cumplimientos', CumplimientoViewSet, basename='cumplimiento')

# URLconf
urlpatterns = [
    path('', include(router.urls)),
]



### -------- normativity
"""
normativity/models.py

Modelos maestros para la taxonomía de la Resolución 3100 de 2019.
Define los Estándares y Criterios que aplican a las IPS.
"""

from django.db import models


class Estandar(models.Model):
    """
    Estándares de la Resolución 3100 de 2019.
    Los 7 estándares principales de habilitación de IPS en Colombia.
    """
    
    ESTANDAR_CHOICES = [
        ('TH', 'Talento Humano'),
        ('INF', 'Infraestructura Física'),
        ('DOT', 'Dotación, Medicamentos e Insumos'),
        ('PO', 'Procesos Organizacionales'),
        ('RS', 'Relacionamiento y Sostenibilidad'),
        ('GI', 'Garantía de Calidad e Información'),
        ('SA', 'Seguridad del Paciente y Ambiente'),
    ]
    
    codigo = models.CharField(
        max_length=10,
        unique=True,
        choices=ESTANDAR_CHOICES,
        verbose_name="Código del estándar"
    )
    nombre = models.CharField(
        max_length=255,
        verbose_name="Nombre del estándar"
    )
    descripcion = models.TextField(
        blank=True,
        null=True,
        verbose_name="Descripción detallada"
    )
    # Metadatos
    estado = models.BooleanField(
        default=True,
        verbose_name="Activo"
    )
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Fecha de creación"
    )
    fecha_actualizacion = models.DateTimeField(
        auto_now=True,
        verbose_name="Fecha de actualización"
    )
    version_resolucion = models.CharField(
        max_length=20,
        default="3100/2019",
        verbose_name="Versión de la resolución"
    )
    
    class Meta:
        db_table = "normativity_estandar"
        verbose_name = "Estándar"
        verbose_name_plural = "Estándares"
        ordering = ['codigo']
    
    def __str__(self):
        return f"{self.get_codigo_display()} - {self.nombre}"


class Criterio(models.Model):
    """
    Criterios de evaluación dentro de cada Estándar.
    Estos criterios definen los requisitos específicos que las IPS deben cumplir.
    """
    
    COMPLEJIDAD_CHOICES = [
        ('BAJA', 'Baja'),
        ('MEDIA', 'Media'),
        ('ALTA', 'Alta'),
    ]
    
    estandar = models.ForeignKey(
        Estandar,
        on_delete=models.PROTECT,
        related_name='criterios',
        verbose_name="Estándar"
    )
    codigo = models.CharField(
        max_length=20,
        verbose_name="Código del criterio",
        help_text="Ej: 1.1, 1.2, 2.1 (debe incluir el número del estándar)"
    )
    nombre = models.CharField(
        max_length=255,
        verbose_name="Nombre del criterio"
    )
    descripcion = models.TextField(
        verbose_name="Descripción del criterio"
    )
    # Propiedades del criterio
    complejidad = models.CharField(
        max_length=10,
        choices=COMPLEJIDAD_CHOICES,
        default='MEDIA',
        verbose_name="Complejidad de implementación"
    )
    aplica_todos = models.BooleanField(
        default=False,
        verbose_name="Aplica a todas las IPS",
        help_text="Si es False, aplica solo según el tipo/complejidad de la IPS"
    )
    es_mandatorio = models.BooleanField(
        default=True,
        verbose_name="Es mandatorio"
    )
    # Vinculación con documentos
    requiere_evidencia_documental = models.BooleanField(
        default=False,
        verbose_name="Requiere evidencia documental"
    )
    # Metadatos
    estado = models.BooleanField(
        default=True,
        verbose_name="Activo"
    )
    notas_interpretacion = models.TextField(
        blank=True,
        null=True,
        verbose_name="Notas de interpretación"
    )
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Fecha de creación"
    )
    fecha_actualizacion = models.DateTimeField(
        auto_now=True,
        verbose_name="Fecha de actualización"
    )
    
    class Meta:
        db_table = "normativity_criterio"
        verbose_name = "Criterio"
        verbose_name_plural = "Criterios"
        unique_together = ('estandar', 'codigo')
        ordering = ['estandar', 'codigo']
        indexes = [
            models.Index(fields=['estandar', 'estado']),
            models.Index(fields=['estado']),
        ]
    
    def __str__(self):
        return f"{self.codigo} - {self.nombre}"


class DocumentoNormativo(models.Model):
    """
    Referencias a documentos normativos relacionados con los criterios.
    Por ej: Resoluciones, Manuales de la Superintendencia de Salud, etc.
    """
    
    TIPO_DOCUMENTO = [
        ('RESOLUCION', 'Resolución'),
        ('ACUERDO', 'Acuerdo'),
        ('DECRETO', 'Decreto'),
        ('MANUAL', 'Manual'),
        ('GUIA', 'Guía'),
        ('CIRCULAR', 'Circular'),
        ('OTRO', 'Otro'),
    ]
    
    titulo = models.CharField(
        max_length=255,
        verbose_name="Título del documento"
    )
    tipo = models.CharField(
        max_length=20,
        choices=TIPO_DOCUMENTO,
        verbose_name="Tipo de documento"
    )
    numero_referencia = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name="Número de referencia",
        help_text="Ej: Res. 1234 de 2020"
    )
    fecha_publicacion = models.DateField(
        blank=True,
        null=True,
        verbose_name="Fecha de publicación"
    )
    url_documento = models.URLField(
        blank=True,
        null=True,
        verbose_name="URL del documento"
    )
    descripcion = models.TextField(
        blank=True,
        null=True,
        verbose_name="Descripción"
    )
    criterios_relacionados = models.ManyToManyField(
        Criterio,
        related_name='documentos_normativos',
        blank=True,
        verbose_name="Criterios relacionados"
    )
    
    class Meta:
        db_table = "normativity_documentonormativo"
        verbose_name = "Documento Normativo"
        verbose_name_plural = "Documentos Normativos"
        ordering = ['-fecha_publicacion']
    
    def __str__(self):
        return f"{self.tipo}: {self.titulo}"


## -----
"""
normativity/views.py

Views para consulta de datos maestros normativos.
"""

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import Estandar, Criterio, DocumentoNormativo
from .serializers import (
    EstandarSerializer,
    EstandarListSerializer,
    CriterioSerializer,
    DocumentoNormativoSerializer,
)


class EstandarViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para consultar Estándares.
    
    Los estándares son datos maestros, por lo que son solo lectura.
    """
    
    permission_classes = [AllowAny]
    queryset = Estandar.objects.filter(estado=True).prefetch_related('criterios')
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['nombre', 'codigo', 'descripcion']
    filterset_fields = ['codigo', 'estado']
    
    def get_serializer_class(self):
        """Usar serializer simplificado en list, detallado en retrieve."""
        if self.action == 'list':
            return EstandarListSerializer
        return EstandarSerializer
    
    @action(detail=False, methods=['get'])
    def todos(self, request):
        """
        Endpoint para obtener todos los estándares con sus criterios.
        Útil para cargar toda la taxonomía en el frontend.
        """
        estandares = self.get_queryset()
        serializer = EstandarSerializer(estandares, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def criterios(self, request, pk=None):
        """
        Obtener todos los criterios de un estándar específico.
        """
        estandar = self.get_object()
        criterios = estandar.criterios.filter(estado=True)
        serializer = CriterioSerializer(criterios, many=True)
        return Response(serializer.data)


class CriterioViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para consultar Criterios.
    
    Los criterios pueden filtrarse por estándar y complejidad.
    """
    
    permission_classes = [AllowAny]
    queryset = Criterio.objects.filter(estado=True).select_related('estandar')
    serializer_class = CriterioSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ['codigo', 'nombre', 'descripcion']
    filterset_fields = ['estandar', 'complejidad', 'aplica_todos', 'es_mandatorio']
    ordering_fields = ['codigo', 'nombre', 'complejidad']
    ordering = ['codigo']
    
    @action(detail=False, methods=['get'])
    def por_complejidad(self, request):
        """
        Agrupar criterios por complejidad.
        """
        complejidad = request.query_params.get('complejidad')
        
        if not complejidad:
            return Response(
                {'error': 'Parámetro "complejidad" requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        criterios = self.get_queryset().filter(complejidad=complejidad)
        serializer = self.get_serializer(criterios, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def mandatorios(self, request):
        """
        Obtener solo criterios mandatorios.
        """
        criterios = self.get_queryset().filter(es_mandatorio=True)
        serializer = self.get_serializer(criterios, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def con_evidencia(self, request):
        """
        Obtener criterios que requieren evidencia documental.
        """
        criterios = self.get_queryset().filter(requiere_evidencia_documental=True)
        serializer = self.get_serializer(criterios, many=True)
        return Response(serializer.data)


class DocumentoNormativoViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para consultar Documentos Normativos.
    
    Proporciona acceso a referencias de leyes, resoluciones, manuales, etc.
    """
    
    permission_classes = [AllowAny]
    queryset = DocumentoNormativo.objects.all().prefetch_related('criterios_relacionados')
    serializer_class = DocumentoNormativoSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ['titulo', 'numero_referencia', 'descripcion']
    filterset_fields = ['tipo']
    ordering_fields = ['fecha_publicacion', 'titulo']
    ordering = ['-fecha_publicacion']
    
    @action(detail=True, methods=['get'])
    def criterios(self, request, pk=None):
        """
        Obtener criterios relacionados con un documento normativo.
        """
        documento = self.get_object()
        criterios = documento.criterios_relacionados.all()
        serializer = CriterioSerializer(criterios, many=True)
        return Response(serializer.data)


## -------
"""
normativity/serializers.py

Serializers para los modelos maestros de normativity.
"""

from rest_framework import serializers
from .models import Estandar, Criterio, DocumentoNormativo


class CriterioSerializer(serializers.ModelSerializer):
    """Serializer para Criterios con validaciones."""
    
    estandar_display = serializers.CharField(
        source='estandar.get_codigo_display',
        read_only=True,
        label="Estándar"
    )
    complejidad_display = serializers.CharField(
        source='get_complejidad_display',
        read_only=True
    )
    
    class Meta:
        model = Criterio
        fields = [
            'id',
            'estandar',
            'estandar_display',
            'codigo',
            'nombre',
            'descripcion',
            'complejidad',
            'complejidad_display',
            'aplica_todos',
            'es_mandatorio',
            'requiere_evidencia_documental',
            'notas_interpretacion',
            'estado',
            'fecha_creacion',
            'fecha_actualizacion',
        ]
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion']
    
    def validate_codigo(self, value):
        """Validar que el código siga el formato esperado."""
        if not value or '.' not in value:
            raise serializers.ValidationError(
                "El código debe seguir el formato: N.N (ej: 1.1, 2.3)"
            )
        return value


class EstandarSerializer(serializers.ModelSerializer):
    """Serializer para Estándares con criterios anidados."""
    
    criterios = CriterioSerializer(many=True, read_only=True)
    codigo_display = serializers.CharField(
        source='get_codigo_display',
        read_only=True
    )
    
    class Meta:
        model = Estandar
        fields = [
            'id',
            'codigo',
            'codigo_display',
            'nombre',
            'descripcion',
            'estado',
            'version_resolucion',
            'criterios',
            'fecha_creacion',
            'fecha_actualizacion',
        ]
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion']


class EstandarListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listar Estándares (sin criterios anidados)."""
    
    codigo_display = serializers.CharField(
        source='get_codigo_display',
        read_only=True
    )
    criterios_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Estandar
        fields = [
            'id',
            'codigo',
            'codigo_display',
            'nombre',
            'estado',
            'criterios_count',
        ]
    
    def get_criterios_count(self, obj):
        return obj.criterios.filter(estado=True).count()


class DocumentoNormativoSerializer(serializers.ModelSerializer):
    """Serializer para Documentos Normativos."""
    
    tipo_display = serializers.CharField(
        source='get_tipo_display',
        read_only=True
    )
    criterios_relacionados = CriterioSerializer(
        many=True,
        read_only=True
    )
    
    class Meta:
        model = DocumentoNormativo
        fields = [
            'id',
            'titulo',
            'tipo',
            'tipo_display',
            'numero_referencia',
            'fecha_publicacion',
            'url_documento',
            'descripcion',
            'criterios_relacionados',
        ]
        read_only_fields = ['id']

## -----
"""
normativity/admin.py

Configuración del admin para los modelos maestros de normativity.
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import Estandar, Criterio, DocumentoNormativo


@admin.register(Estandar)
class EstandarAdmin(admin.ModelAdmin):
    """Admin para Estándares con lista de criterios."""
    
    list_display = [
        'codigo_colored',
        'nombre',
        'criterios_count',
        'estado',
        'version_resolucion',
        'fecha_actualizacion',
    ]
    list_filter = ['estado', 'codigo', 'fecha_creacion']
    search_fields = ['codigo', 'nombre', 'descripcion']
    readonly_fields = ['fecha_creacion', 'fecha_actualizacion']
    fieldsets = (
        ('Información Básica', {
            'fields': ('codigo', 'nombre', 'descripcion')
        }),
        ('Estado', {
            'fields': ('estado', 'version_resolucion')
        }),
        ('Auditoría', {
            'fields': ('fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',)
        }),
    )
    
    def codigo_colored(self, obj):
        """Mostrar código con color según el tipo."""
        colors = {
            'TH': '#FF6B6B',   # Rojo
            'INF': '#4ECDC4',  # Turquesa
            'DOT': '#45B7D1',  # Azul
            'PO': '#FFA07A',   # Coral
            'RS': '#98D8C8',   # Verde menta
            'GI': '#F7DC6F',   # Amarillo
            'SA': '#BB8FCE',   # Púrpura
        }
        color = colors.get(obj.codigo, '#999999')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; '
            'border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            obj.get_codigo_display()
        )
    codigo_colored.short_description = 'Código'
    
    def criterios_count(self, obj):
        """Contar criterios activos."""
        count = obj.criterios.filter(estado=True).count()
        return format_html(
            '<span style="background-color: #D5F4E6; color: #27AE60; '
            'padding: 3px 8px; border-radius: 3px; font-weight: bold;">{}</span>',
            count
        )
    criterios_count.short_description = 'Criterios Activos'


@admin.register(Criterio)
class CriterioAdmin(admin.ModelAdmin):
    """Admin para Criterios con filtros y búsqueda avanzada."""
    
    list_display = [
        'codigo_badge',
        'nombre',
        'estandar',
        'complejidad_colored',
        'es_mandatorio_badge',
        'aplica_todos_badge',
        'requiere_evidencia_documental',
        'estado',
    ]
    list_filter = [
        'estandar',
        'complejidad',
        'aplica_todos',
        'es_mandatorio',
        'requiere_evidencia_documental',
        'estado',
        'fecha_creacion',
    ]
    search_fields = ['codigo', 'nombre', 'descripcion']
    readonly_fields = ['fecha_creacion', 'fecha_actualizacion']
    
    fieldsets = (
        ('Identificación', {
            'fields': ('estandar', 'codigo', 'nombre')
        }),
        ('Descripción', {
            'fields': ('descripcion', 'notas_interpretacion')
        }),
        ('Propiedades', {
            'fields': (
                'complejidad',
                'aplica_todos',
                'es_mandatorio',
                'requiere_evidencia_documental'
            )
        }),
        ('Estado', {
            'fields': ('estado',)
        }),
        ('Auditoría', {
            'fields': ('fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',)
        }),
    )
    
    def codigo_badge(self, obj):
        """Mostrar código como badge."""
        return format_html(
            '<span style="background-color: #E8F8F5; color: #16A085; '
            'padding: 4px 8px; border-radius: 3px; font-weight: bold;">{}</span>',
            obj.codigo
        )
    codigo_badge.short_description = 'Código'
    
    def complejidad_colored(self, obj):
        """Mostrar complejidad con colores."""
        colors = {
            'BAJA': '#52BE80',    # Verde
            'MEDIA': '#F39C12',   # Naranja
            'ALTA': '#E74C3C',    # Rojo
        }
        color = colors.get(obj.complejidad, '#95A5A6')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 4px 8px; '
            'border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            obj.get_complejidad_display()
        )
    complejidad_colored.short_description = 'Complejidad'
    
    def es_mandatorio_badge(self, obj):
        """Mostrar si es mandatorio."""
        if obj.es_mandatorio:
            return format_html(
                '<span style="background-color: #E74C3C; color: white; '
                'padding: 4px 8px; border-radius: 3px;">Mandatorio</span>'
            )
        return format_html(
            '<span style="background-color: #95A5A6; color: white; '
            'padding: 4px 8px; border-radius: 3px;">Opcional</span>'
        )
    es_mandatorio_badge.short_description = 'Tipo'
    
    def aplica_todos_badge(self, obj):
        """Mostrar si aplica a todas las IPS."""
        if obj.aplica_todos:
            return format_html(
                '<span style="background-color: #3498DB; color: white; '
                'padding: 4px 8px; border-radius: 3px;">Aplica a Todos</span>'
            )
        return format_html(
            '<span style="background-color: #BDC3C7; color: white; '
            'padding: 4px 8px; border-radius: 3px;">Selectivo</span>'
        )
    aplica_todos_badge.short_description = 'Aplicabilidad'


@admin.register(DocumentoNormativo)
class DocumentoNormativoAdmin(admin.ModelAdmin):
    """Admin para Documentos Normativos."""
    
    list_display = [
        'titulo',
        'tipo_colored',
        'numero_referencia',
        'fecha_publicacion',
        'criterios_count',
        'tiene_url',
    ]
    list_filter = ['tipo', 'fecha_publicacion']
    search_fields = ['titulo', 'numero_referencia', 'descripcion']
    filter_horizontal = ['criterios_relacionados']
    readonly_fields = ['id']
    
    fieldsets = (
        ('Identificación', {
            'fields': ('titulo', 'tipo', 'numero_referencia', 'fecha_publicacion')
        }),
        ('Contenido', {
            'fields': ('descripcion', 'url_documento')
        }),
        ('Relaciones', {
            'fields': ('criterios_relacionados',),
        }),
    )
    
    def tipo_colored(self, obj):
        """Mostrar tipo con colores."""
        colors = {
            'RESOLUCION': '#3498DB',
            'ACUERDO': '#2ECC71',
            'DECRETO': '#E74C3C',
            'MANUAL': '#F39C12',
            'GUIA': '#9B59B6',
            'CIRCULAR': '#1ABC9C',
            'OTRO': '#95A5A6',
        }
        color = colors.get(obj.tipo, '#34495E')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 4px 8px; '
            'border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            obj.get_tipo_display()
        )
    tipo_colored.short_description = 'Tipo'
    
    def criterios_count(self, obj):
        """Contar criterios relacionados."""
        count = obj.criterios_relacionados.count()
        return format_html(
            '<span style="background-color: #E8F8F5; color: #16A085; '
            'padding: 4px 8px; border-radius: 3px; font-weight: bold;">{}</span>',
            count
        )
    criterios_count.short_description = 'Criterios Relacionados'
    
    def tiene_url(self, obj):
        """Mostrar si tiene URL."""
        if obj.url_documento:
            return format_html(
                '<a href="{}" target="_blank" style="color: #3498DB; text-decoration: none; '
                'font-weight: bold;">📄 Abrir</a>',
                obj.url_documento
            )
        return format_html(
            '<span style="color: #95A5A6;">Sin URL</span>'
        )
    tiene_url.short_description = 'Documento'


## -----
"""
normativity/urls.py

Rutas para los endpoints de normativity.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import EstandarViewSet, CriterioViewSet, DocumentoNormativoViewSet

router = DefaultRouter()
router.register(r'estandares', EstandarViewSet, basename='estandar')
router.register(r'criterios', CriterioViewSet, basename='criterio')
router.register(r'documentos-normativos', DocumentoNormativoViewSet, basename='documento-normativo')

urlpatterns = [
    path('', include(router.urls)),
]


#### ---- mejoras
"""
mejoras/models.py

Modelos transversales para Planes de Mejora y Hallazgos.
App independiente reutilizable por: habilitacion, audit, indicators.

Ciclo PHVA: Un hallazgo (de cualquier origen) genera un plan de mejora
con seguimiento de estado, porcentaje de avance y fechas de vencimiento.
"""

import os
import uuid

from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from datetime import timedelta


# ═══════════════════════════════════════════════════════════════════
# UTILIDADES
# ═══════════════════════════════════════════════════════════════════

ALLOWED_SOPORTE_EXTENSIONS = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg', '.xls', '.xlsx']


def soporte_upload_path(instance, filename):
    """
    Genera ruta única para soportes: media/SoportesPlanes/<plan_id>/<uuid>_<filename>
    """
    ext = os.path.splitext(filename)[1].lower()
    unique_name = f"{uuid.uuid4().hex[:12]}_{filename}"
    plan_id = instance.plan_mejora_id or 'sin_plan'
    return os.path.join('SoportesPlanes', str(plan_id), unique_name)


def validate_soporte_extension(value):
    """Valida que la extensión del archivo sea permitida."""
    ext = os.path.splitext(value.name)[1].lower()
    if ext not in ALLOWED_SOPORTE_EXTENSIONS:
        raise ValidationError(
            f'Extensión "{ext}" no permitida. '
            f'Extensiones válidas: {", ".join(ALLOWED_SOPORTE_EXTENSIONS)}'
        )


# ═══════════════════════════════════════════════════════════════════
# MANAGERS
# ═══════════════════════════════════════════════════════════════════

class PlanMejoraManager(models.Manager):
    """Manager personalizado con filtros frecuentes."""

    def vencidos(self):
        return self.filter(
            fecha_vencimiento__lt=timezone.now().date()
        ).exclude(estado='COMPLETADO')

    def proximos_a_vencer(self, dias=30):
        fecha_limite = timezone.now().date() + timedelta(days=dias)
        return self.filter(
            fecha_vencimiento__lte=fecha_limite,
            fecha_vencimiento__gte=timezone.now().date()
        ).exclude(estado__in=['COMPLETADO', 'VENCIDO'])

    def por_origen(self, origen_tipo):
        return self.filter(origen_tipo=origen_tipo)

    def por_autoevaluacion(self, autoevaluacion_id):
        return self.filter(
            origen_tipo='HABILITACION',
            cumplimiento__autoevaluacion_id=autoevaluacion_id
        )

    def por_auditoria(self, auditoria_id):
        return self.filter(
            origen_tipo='AUDITORIA',
            auditoria_id=auditoria_id
        )

    def por_indicador(self, indicador_id):
        return self.filter(
            origen_tipo='INDICADOR',
            resultado_indicador__indicator_id=indicador_id
        )


# ═══════════════════════════════════════════════════════════════════
# PLAN DE MEJORA
# ═══════════════════════════════════════════════════════════════════

class PlanMejora(models.Model):
    """
    Plan de mejora transversal. Puede originarse desde:
    - Autoevaluación de habilitación (origen_tipo='HABILITACION')
    - Auditoría (origen_tipo='AUDITORIA')
    - Indicador por debajo de la meta (origen_tipo='INDICADOR')
    """

    class Estado(models.TextChoices):
        PENDIENTE = 'PENDIENTE', 'Pendiente'
        EN_CURSO = 'EN_CURSO', 'En Curso'
        COMPLETADO = 'COMPLETADO', 'Completado'
        VENCIDO = 'VENCIDO', 'Vencido'

    class OrigenTipo(models.TextChoices):
        HABILITACION = 'HABILITACION', 'Autoevaluación de Habilitación'
        AUDITORIA = 'AUDITORIA', 'Auditoría'
        INDICADOR = 'INDICADOR', 'Indicador'

    # ─── Identificación ───
    numero_plan = models.CharField(
        max_length=50,
        unique=True,
        help_text="Identificador único del plan (ej: PM-2026-001)"
    )
    descripcion = models.TextField(
        help_text="Descripción general del plan de mejora"
    )

    # ─── Origen / Trazabilidad ───
    origen_tipo = models.CharField(
        max_length=20,
        choices=OrigenTipo.choices,
        help_text="Módulo que originó este plan de mejora"
    )

    # FK opcionales según el origen
    cumplimiento = models.ForeignKey(
        'habilitacion.Cumplimiento',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='planes_mejora',
        help_text="Cumplimiento de habilitación que originó este plan (origen=HABILITACION)"
    )
    autoevaluacion = models.ForeignKey(
        'habilitacion.Autoevaluacion',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='planes_mejora',
        help_text="Autoevaluación asociada (origen=HABILITACION)"
    )
    criterio = models.ForeignKey(
        'normativity.Criterio',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='planes_mejora',
        help_text="Criterio normativo relacionado"
    )
    auditoria = models.ForeignKey(
        'audit.Auditoria',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='planes_mejora',
        help_text="Auditoría que originó este plan (origen=AUDITORIA)"
    )
    resultado_indicador = models.ForeignKey(
        'indicators.Result',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='planes_mejora',
        help_text="Resultado de indicador que originó este plan (origen=INDICADOR)"
    )

    # ─── Contexto del hallazgo ───
    estado_cumplimiento_actual = models.CharField(
        max_length=100,
        blank=True,
        default='',
        help_text="Estado del cumplimiento/indicador al momento de crear el plan"
    )
    objetivo_mejorado = models.TextField(
        blank=True,
        default='',
        help_text="Meta u objetivo que se quiere alcanzar"
    )

    # ─── Plan de acción ───
    acciones_implementar = models.TextField(
        help_text="Acciones concretas a implementar para la mejora"
    )
    responsable = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='planes_mejora_asignados',
        help_text="Usuario responsable de ejecutar el plan"
    )

    # ─── Fechas ───
    fecha_inicio = models.DateField(
        help_text="Fecha de inicio del plan"
    )
    fecha_vencimiento = models.DateField(
        help_text="Fecha límite para completar el plan"
    )
    fecha_implementacion = models.DateField(
        null=True,
        blank=True,
        help_text="Fecha en que se completó la implementación"
    )

    # ─── Seguimiento ───
    porcentaje_avance = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Porcentaje de avance (0-100)"
    )
    estado = models.CharField(
        max_length=20,
        choices=Estado.choices,
        default=Estado.PENDIENTE,
        help_text="Estado actual del plan"
    )
    evidencia = models.TextField(
        blank=True,
        default='',
        help_text="Descripción de la evidencia o referencia a documentos"
    )
    observaciones = models.TextField(
        blank=True,
        default='',
        help_text="Observaciones adicionales"
    )

    # ─── Auditoría ───
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    objects = PlanMejoraManager()

    class Meta:
        db_table = 'mejoras_plan_mejora'
        ordering = ['-fecha_creacion']
        verbose_name = 'Plan de Mejora'
        verbose_name_plural = 'Planes de Mejora'
        indexes = [
            models.Index(fields=['estado']),
            models.Index(fields=['origen_tipo']),
            models.Index(fields=['fecha_vencimiento']),
            models.Index(fields=['autoevaluacion']),
            models.Index(fields=['auditoria']),
            models.Index(fields=['resultado_indicador']),
        ]

    def __str__(self):
        return f"{self.numero_plan} - {self.get_origen_tipo_display()} - {self.descripcion[:50]}"

    # ─── Propiedades calculadas ───

    @property
    def esta_vencido(self) -> bool:
        """True si la fecha de vencimiento ya pasó y no está completado."""
        if self.estado == self.Estado.COMPLETADO:
            return False
        return self.fecha_vencimiento < timezone.now().date()

    @property
    def dias_restantes(self) -> int | None:
        """Días restantes para el vencimiento. Negativo si ya venció."""
        if not self.fecha_vencimiento:
            return None
        return (self.fecha_vencimiento - timezone.now().date()).days

    @property
    def proximo_a_vencer(self) -> bool:
        """True si vence en los próximos 30 días."""
        dias = self.dias_restantes
        if dias is None:
            return False
        return 0 < dias <= 30

    def marcar_vencido(self):
        """Actualiza el estado a VENCIDO si aplica."""
        if self.esta_vencido and self.estado not in [self.Estado.COMPLETADO, self.Estado.VENCIDO]:
            self.estado = self.Estado.VENCIDO
            self.save(update_fields=['estado', 'fecha_actualizacion'])

    @property
    def origen_detalle(self) -> str:
        """Retorna una descripción legible del origen del plan."""
        if self.origen_tipo == self.OrigenTipo.HABILITACION and self.cumplimiento:
            return f"Cumplimiento: {self.cumplimiento}"
        elif self.origen_tipo == self.OrigenTipo.AUDITORIA and self.auditoria:
            return f"Auditoría: {self.auditoria}"
        elif self.origen_tipo == self.OrigenTipo.INDICADOR and self.resultado_indicador:
            return f"Indicador: {self.resultado_indicador.indicator.name}"
        return self.get_origen_tipo_display()


# ═══════════════════════════════════════════════════════════════════
# HALLAZGO
# ═══════════════════════════════════════════════════════════════════

class Hallazgo(models.Model):
    """
    Hallazgo identificado durante una evaluación (de cualquier origen).
    Puede estar vinculado a un plan de mejora.
    """

    class TipoHallazgo(models.TextChoices):
        FORTALEZA = 'FORTALEZA', 'Fortaleza'
        OPORTUNIDAD_MEJORA = 'OPORTUNIDAD_MEJORA', 'Oportunidad de Mejora'
        NO_CONFORMIDAD = 'NO_CONFORMIDAD', 'No Conformidad'
        HALLAZGO = 'HALLAZGO', 'Hallazgo'

    class Severidad(models.TextChoices):
        BAJA = 'BAJA', 'Baja'
        MEDIA = 'MEDIA', 'Media'
        ALTA = 'ALTA', 'Alta'
        CRITICA = 'CRÍTICA', 'Crítica'

    class EstadoHallazgo(models.TextChoices):
        ABIERTO = 'ABIERTO', 'Abierto'
        EN_SEGUIMIENTO = 'EN_SEGUIMIENTO', 'En Seguimiento'
        CERRADO = 'CERRADO', 'Cerrado'

    class OrigenTipo(models.TextChoices):
        HABILITACION = 'HABILITACION', 'Autoevaluación de Habilitación'
        AUDITORIA = 'AUDITORIA', 'Auditoría'
        INDICADOR = 'INDICADOR', 'Indicador'

    # ─── Identificación ───
    numero_hallazgo = models.CharField(
        max_length=50,
        unique=True,
        help_text="Identificador único del hallazgo (ej: HAL-2026-001)"
    )
    descripcion = models.TextField(
        help_text="Descripción detallada del hallazgo"
    )
    tipo = models.CharField(
        max_length=30,
        choices=TipoHallazgo.choices,
        help_text="Tipo de hallazgo"
    )
    severidad = models.CharField(
        max_length=10,
        choices=Severidad.choices,
        help_text="Nivel de severidad"
    )

    # ─── Origen / Trazabilidad ───
    origen_tipo = models.CharField(
        max_length=20,
        choices=OrigenTipo.choices,
        help_text="Módulo donde se identificó este hallazgo"
    )

    # FK opcionales según el origen
    autoevaluacion = models.ForeignKey(
        'habilitacion.Autoevaluacion',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='hallazgos',
        help_text="Autoevaluación donde se identificó (origen=HABILITACION)"
    )
    datos_prestador = models.ForeignKey(
        'habilitacion.DatosPrestador',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='hallazgos',
        help_text="Prestador asociado (origen=HABILITACION)"
    )
    criterio = models.ForeignKey(
        'normativity.Criterio',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='hallazgos',
        help_text="Criterio normativo relacionado"
    )
    auditoria = models.ForeignKey(
        'audit.Auditoria',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='hallazgos',
        help_text="Auditoría donde se identificó (origen=AUDITORIA)"
    )
    resultado_indicador = models.ForeignKey(
        'indicators.Result',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='hallazgos',
        help_text="Resultado de indicador que generó el hallazgo (origen=INDICADOR)"
    )

    # ─── Relación con Plan de Mejora ───
    plan_mejora = models.ForeignKey(
        PlanMejora,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='hallazgos',
        help_text="Plan de mejora asociado para resolver este hallazgo"
    )

    # ─── Datos adicionales ───
    area_responsable = models.CharField(
        max_length=200,
        blank=True,
        default='',
        help_text="Área o departamento responsable"
    )
    estado = models.CharField(
        max_length=20,
        choices=EstadoHallazgo.choices,
        default=EstadoHallazgo.ABIERTO,
        help_text="Estado actual del hallazgo"
    )
    fecha_identificacion = models.DateField(
        help_text="Fecha en que se identificó el hallazgo"
    )
    fecha_cierre = models.DateField(
        null=True,
        blank=True,
        help_text="Fecha en que se cerró el hallazgo"
    )
    observaciones = models.TextField(
        blank=True,
        default='',
        help_text="Observaciones adicionales"
    )

    # ─── Auditoría ───
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'mejoras_hallazgo'
        ordering = ['-fecha_creacion']
        verbose_name = 'Hallazgo'
        verbose_name_plural = 'Hallazgos'
        indexes = [
            models.Index(fields=['estado']),
            models.Index(fields=['tipo']),
            models.Index(fields=['severidad']),
            models.Index(fields=['origen_tipo']),
            models.Index(fields=['autoevaluacion']),
            models.Index(fields=['auditoria']),
        ]

    def __str__(self):
        return f"{self.numero_hallazgo} - {self.get_tipo_display()} ({self.get_severidad_display()})"

    @property
    def origen_detalle(self) -> str:
        """Retorna una descripción legible del origen del hallazgo."""
        if self.origen_tipo == self.OrigenTipo.HABILITACION and self.autoevaluacion:
            return f"Autoevaluación: {self.autoevaluacion}"
        elif self.origen_tipo == self.OrigenTipo.AUDITORIA and self.auditoria:
            return f"Auditoría: {self.auditoria}"
        elif self.origen_tipo == self.OrigenTipo.INDICADOR and self.resultado_indicador:
            return f"Indicador: {self.resultado_indicador.indicator.name}"
        return self.get_origen_tipo_display()


# ═══════════════════════════════════════════════════════════════════
# SOPORTE / DOCUMENTO ADJUNTO DE PLAN DE MEJORA
# ═══════════════════════════════════════════════════════════════════

class SoportePlan(models.Model):
    """
    Archivo soporte adjunto a un Plan de Mejora.
    Soporta PDF, Word (.doc/.docx), imágenes (.png/.jpg) y Excel (.xls/.xlsx).
    Almacenados en media/SoportesPlanes/<plan_id>/<uuid>_<nombre_original>.
    """

    class TipoSoporte(models.TextChoices):
        EVIDENCIA = 'EVIDENCIA', 'Evidencia'
        ACTA = 'ACTA', 'Acta'
        INFORME = 'INFORME', 'Informe'
        FOTOGRAFIA = 'FOTOGRAFIA', 'Fotografía'
        PLAN_ACCION = 'PLAN_ACCION', 'Plan de Acción'
        OTRO = 'OTRO', 'Otro'

    plan_mejora = models.ForeignKey(
        PlanMejora,
        on_delete=models.CASCADE,
        related_name='soportes',
        help_text="Plan de mejora al que pertenece este soporte"
    )
    archivo = models.FileField(
        upload_to=soporte_upload_path,
        validators=[validate_soporte_extension],
        help_text="Archivo soporte (PDF, Word, PNG, Excel)"
    )
    nombre_original = models.CharField(
        max_length=255,
        help_text="Nombre original del archivo subido"
    )
    tipo_soporte = models.CharField(
        max_length=20,
        choices=TipoSoporte.choices,
        default=TipoSoporte.EVIDENCIA,
        help_text="Tipo de soporte"
    )
    descripcion = models.CharField(
        max_length=500,
        blank=True,
        default='',
        help_text="Descripción breve del soporte"
    )
    tamano_bytes = models.PositiveIntegerField(
        default=0,
        help_text="Tamaño del archivo en bytes"
    )
    subido_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='soportes_subidos',
        help_text="Usuario que subió el archivo"
    )
    fecha_subida = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'mejoras_soporte_plan'
        ordering = ['-fecha_subida']
        verbose_name = 'Soporte de Plan'
        verbose_name_plural = 'Soportes de Planes'

    def __str__(self):
        return f"{self.nombre_original} ({self.plan_mejora.numero_plan})"

    def save(self, *args, **kwargs):
        if self.archivo and not self.nombre_original:
            self.nombre_original = os.path.basename(self.archivo.name)
        if self.archivo and not self.tamano_bytes:
            try:
                self.tamano_bytes = self.archivo.size
            except Exception:
                pass
        super().save(*args, **kwargs)

    @property
    def extension(self):
        return os.path.splitext(self.nombre_original)[1].lower()

    @property
    def tamano_legible(self):
        """Retorna el tamaño en formato legible (KB, MB)."""
        if self.tamano_bytes < 1024:
            return f"{self.tamano_bytes} B"
        elif self.tamano_bytes < 1024 * 1024:
            return f"{self.tamano_bytes / 1024:.1f} KB"
        return f"{self.tamano_bytes / (1024 * 1024):.1f} MB"

## ---
"""
mejoras/views.py

ViewSets para Planes de Mejora y Hallazgos.
Endpoints transversales con filtrado por origen (habilitacion, audit, indicators).
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Avg, Count, Q
from django.utils import timezone

from .models import PlanMejora, Hallazgo, SoportePlan
from .serializers import (
    PlanMejoraListSerializer,
    PlanMejoraDetailSerializer,
    PlanMejoraCreateUpdateSerializer,
    PlanMejoraResumenSerializer,
    HallazgoListSerializer,
    HallazgoDetailSerializer,
    HallazgoCreateUpdateSerializer,
    EstadisticasHallazgosSerializer,
    SoportePlanSerializer,
    SoportePlanUploadSerializer,
)


# ═══════════════════════════════════════════════════════════════════
# PLAN DE MEJORA VIEWSET
# ═══════════════════════════════════════════════════════════════════

class PlanMejoraViewSet(viewsets.ModelViewSet):
    """
    ViewSet completo para Planes de Mejora.

    Filtros disponibles:
        ?origen_tipo=HABILITACION|AUDITORIA|INDICADOR
        ?estado=PENDIENTE|EN_CURSO|COMPLETADO|VENCIDO
        ?autoevaluacion=ID
        ?auditoria=ID
        ?criterio=ID
        ?responsable=ID
        ?search=texto
        ?ordering=-fecha_vencimiento
    """

    queryset = PlanMejora.objects.select_related(
        'criterio', 'criterio__estandar',
        'autoevaluacion', 'cumplimiento',
        'auditoria', 'resultado_indicador',
        'responsable',
    ).all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'origen_tipo', 'estado', 'autoevaluacion', 'auditoria',
        'criterio', 'responsable', 'cumplimiento', 'resultado_indicador',
    ]
    search_fields = ['numero_plan', 'descripcion', 'acciones_implementar']
    ordering_fields = [
        'fecha_creacion', 'fecha_vencimiento', 'porcentaje_avance',
        'estado', 'origen_tipo',
    ]
    ordering = ['-fecha_creacion']

    def get_serializer_class(self):
        if self.action == 'list':
            return PlanMejoraListSerializer
        elif self.action == 'retrieve':
            return PlanMejoraDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return PlanMejoraCreateUpdateSerializer
        return PlanMejoraListSerializer

    # ─── Actions personalizadas ───

    @action(detail=False, methods=['get'], url_path='vencidos')
    def vencidos(self, request):
        """Planes de mejora con fecha de vencimiento pasada y no completados."""
        queryset = self.get_queryset().filter(
            fecha_vencimiento__lt=timezone.now().date()
        ).exclude(estado='COMPLETADO')

        # Filtros opcionales
        origen = request.query_params.get('origen_tipo')
        if origen:
            queryset = queryset.filter(origen_tipo=origen)

        autoevaluacion = request.query_params.get('autoevaluacion')
        if autoevaluacion:
            queryset = queryset.filter(autoevaluacion_id=autoevaluacion)

        auditoria = request.query_params.get('auditoria')
        if auditoria:
            queryset = queryset.filter(auditoria_id=auditoria)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = PlanMejoraListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = PlanMejoraListSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='proximos-vencer')
    def proximos_vencer(self, request):
        """Planes que vencen en los próximos N días (default: 30)."""
        dias = int(request.query_params.get('dias', 30))
        from datetime import timedelta
        fecha_limite = timezone.now().date() + timedelta(days=dias)

        queryset = self.get_queryset().filter(
            fecha_vencimiento__lte=fecha_limite,
            fecha_vencimiento__gte=timezone.now().date()
        ).exclude(estado__in=['COMPLETADO', 'VENCIDO'])

        origen = request.query_params.get('origen_tipo')
        if origen:
            queryset = queryset.filter(origen_tipo=origen)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = PlanMejoraListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = PlanMejoraListSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='resumen')
    def resumen(self, request):
        """
        Estadísticas resumidas de planes de mejora.
        Filtros opcionales: ?origen_tipo=X&autoevaluacion=ID&auditoria=ID
        """
        queryset = self.get_queryset()

        origen = request.query_params.get('origen_tipo')
        if origen:
            queryset = queryset.filter(origen_tipo=origen)

        autoevaluacion = request.query_params.get('autoevaluacion')
        if autoevaluacion:
            queryset = queryset.filter(autoevaluacion_id=autoevaluacion)

        auditoria = request.query_params.get('auditoria')
        if auditoria:
            queryset = queryset.filter(auditoria_id=auditoria)

        data = {
            'total_planes': queryset.count(),
            'pendientes': queryset.filter(estado='PENDIENTE').count(),
            'en_curso': queryset.filter(estado='EN_CURSO').count(),
            'completados': queryset.filter(estado='COMPLETADO').count(),
            'vencidos': queryset.filter(
                fecha_vencimiento__lt=timezone.now().date()
            ).exclude(estado='COMPLETADO').count(),
            'porcentaje_promedio_avance': queryset.aggregate(
                avg=Avg('porcentaje_avance')
            )['avg'] or 0.0,
        }

        serializer = PlanMejoraResumenSerializer(data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='por-origen')
    def por_origen(self, request):
        """
        Resumen agrupado por tipo de origen.
        Retorna conteos por cada origen_tipo.
        """
        data = PlanMejora.objects.values('origen_tipo').annotate(
            total=Count('id'),
            pendientes=Count('id', filter=Q(estado='PENDIENTE')),
            en_curso=Count('id', filter=Q(estado='EN_CURSO')),
            completados=Count('id', filter=Q(estado='COMPLETADO')),
            vencidos=Count('id', filter=Q(
                fecha_vencimiento__lt=timezone.now().date()
            ) & ~Q(estado='COMPLETADO')),
        ).order_by('origen_tipo')

        return Response(list(data))

    # ─── Soporte / Archivos adjuntos ───

    @action(detail=True, methods=['get', 'post'], url_path='soportes',
            parser_classes=[MultiPartParser, FormParser, JSONParser])
    def soportes(self, request, pk=None):
        """
        GET: Lista soportes del plan.
        POST: Sube un nuevo soporte (multipart/form-data).
        """
        plan = self.get_object()

        if request.method == 'GET':
            soportes = plan.soportes.all()
            serializer = SoportePlanSerializer(soportes, many=True)
            return Response(serializer.data)

        # POST
        data = request.data.copy()
        data['plan_mejora'] = plan.id
        serializer = SoportePlanUploadSerializer(
            data=data, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        soporte = serializer.save()
        return Response(
            SoportePlanSerializer(soporte).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['delete'], url_path='soportes/(?P<soporte_id>[0-9]+)')
    def eliminar_soporte(self, request, pk=None, soporte_id=None):
        """Elimina un soporte específico del plan."""
        plan = self.get_object()
        try:
            soporte = plan.soportes.get(id=soporte_id)
        except SoportePlan.DoesNotExist:
            return Response(
                {'detail': 'Soporte no encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )
        # Eliminar archivo físico
        if soporte.archivo:
            soporte.archivo.delete(save=False)
        soporte.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ═══════════════════════════════════════════════════════════════════
# HALLAZGO VIEWSET
# ═══════════════════════════════════════════════════════════════════

class HallazgoViewSet(viewsets.ModelViewSet):
    """
    ViewSet completo para Hallazgos.

    Filtros disponibles:
        ?origen_tipo=HABILITACION|AUDITORIA|INDICADOR
        ?tipo=FORTALEZA|OPORTUNIDAD_MEJORA|NO_CONFORMIDAD|HALLAZGO
        ?severidad=BAJA|MEDIA|ALTA|CRÍTICA
        ?estado=ABIERTO|EN_SEGUIMIENTO|CERRADO
        ?autoevaluacion=ID
        ?auditoria=ID
        ?criterio=ID
        ?plan_mejora=ID
    """

    queryset = Hallazgo.objects.select_related(
        'autoevaluacion', 'datos_prestador',
        'criterio', 'criterio__estandar',
        'auditoria', 'resultado_indicador',
        'plan_mejora',
    ).all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'origen_tipo', 'tipo', 'severidad', 'estado',
        'autoevaluacion', 'datos_prestador', 'auditoria',
        'criterio', 'plan_mejora', 'resultado_indicador',
    ]
    search_fields = ['numero_hallazgo', 'descripcion', 'area_responsable']
    ordering_fields = [
        'fecha_creacion', 'fecha_identificacion', 'severidad',
        'estado', 'tipo', 'origen_tipo',
    ]
    ordering = ['-fecha_creacion']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return HallazgoDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return HallazgoCreateUpdateSerializer
        return HallazgoListSerializer

    @action(detail=False, methods=['get'], url_path='estadisticas')
    def estadisticas(self, request):
        """
        Estadísticas de hallazgos.
        Filtros opcionales: ?origen_tipo=X&autoevaluacion=ID&auditoria=ID
        """
        queryset = self.get_queryset()

        origen = request.query_params.get('origen_tipo')
        if origen:
            queryset = queryset.filter(origen_tipo=origen)

        autoevaluacion = request.query_params.get('autoevaluacion')
        if autoevaluacion:
            queryset = queryset.filter(autoevaluacion_id=autoevaluacion)

        auditoria = request.query_params.get('auditoria')
        if auditoria:
            queryset = queryset.filter(auditoria_id=auditoria)

        data = {
            'total_hallazgos': queryset.count(),
            'fortalezas': queryset.filter(tipo='FORTALEZA').count(),
            'oportunidades_mejora': queryset.filter(tipo='OPORTUNIDAD_MEJORA').count(),
            'no_conformidades': queryset.filter(tipo='NO_CONFORMIDAD').count(),
            'hallazgos': queryset.filter(tipo='HALLAZGO').count(),
            'abiertos': queryset.filter(estado='ABIERTO').count(),
            'en_seguimiento': queryset.filter(estado='EN_SEGUIMIENTO').count(),
            'cerrados': queryset.filter(estado='CERRADO').count(),
            'criticos': queryset.filter(severidad='CRÍTICA').count(),
        }

        serializer = EstadisticasHallazgosSerializer(data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='por-origen')
    def por_origen(self, request):
        """
        Resumen agrupado por tipo de origen.
        """
        data = Hallazgo.objects.values('origen_tipo').annotate(
            total=Count('id'),
            abiertos=Count('id', filter=Q(estado='ABIERTO')),
            en_seguimiento=Count('id', filter=Q(estado='EN_SEGUIMIENTO')),
            cerrados=Count('id', filter=Q(estado='CERRADO')),
            criticos=Count('id', filter=Q(severidad='CRÍTICA')),
        ).order_by('origen_tipo')

        return Response(list(data))

    @action(detail=False, methods=['get'], url_path='sin-plan')
    def sin_plan(self, request):
        """Hallazgos que no tienen plan de mejora asociado."""
        queryset = self.get_queryset().filter(plan_mejora__isnull=True)

        origen = request.query_params.get('origen_tipo')
        if origen:
            queryset = queryset.filter(origen_tipo=origen)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = HallazgoListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = HallazgoListSerializer(queryset, many=True)
        return Response(serializer.data)

## ---
"""
mejoras/serializers.py

Serializers para Planes de Mejora y Hallazgos.
Incluye serializers de listado, detalle, creación y estadísticas.
"""

from rest_framework import serializers
from .models import PlanMejora, Hallazgo, SoportePlan


# ═══════════════════════════════════════════════════════════════════
# SOPORTE DE PLAN - SERIALIZERS
# ═══════════════════════════════════════════════════════════════════

class SoportePlanSerializer(serializers.ModelSerializer):
    """Serializer para listar/detalle de soportes."""
    tipo_soporte_display = serializers.CharField(source='get_tipo_soporte_display', read_only=True)
    tamano_legible = serializers.CharField(read_only=True)
    extension = serializers.CharField(read_only=True)
    subido_por_nombre = serializers.SerializerMethodField()

    class Meta:
        model = SoportePlan
        fields = [
            'id', 'plan_mejora', 'archivo', 'nombre_original',
            'tipo_soporte', 'tipo_soporte_display',
            'descripcion', 'tamano_bytes', 'tamano_legible', 'extension',
            'subido_por', 'subido_por_nombre', 'fecha_subida',
        ]

    def get_subido_por_nombre(self, obj):
        if obj.subido_por:
            nombre = f"{obj.subido_por.first_name} {obj.subido_por.last_name}".strip()
            return nombre or obj.subido_por.username
        return None


class SoportePlanUploadSerializer(serializers.ModelSerializer):
    """Serializer para subir soportes (multipart/form-data)."""

    class Meta:
        model = SoportePlan
        fields = [
            'id', 'plan_mejora', 'archivo',
            'tipo_soporte', 'descripcion',
        ]

    def validate_archivo(self, value):
        # Máximo 10 MB
        max_size = 10 * 1024 * 1024
        if value.size > max_size:
            raise serializers.ValidationError(
                f"El archivo excede el tamaño máximo de 10 MB. Tamaño: {value.size / (1024*1024):.1f} MB"
            )
        return value

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            validated_data['subido_por'] = request.user
        archivo = validated_data.get('archivo')
        if archivo:
            validated_data['nombre_original'] = archivo.name
            validated_data['tamano_bytes'] = archivo.size
        return super().create(validated_data)


# ═══════════════════════════════════════════════════════════════════
# PLAN DE MEJORA - SERIALIZERS
# ═══════════════════════════════════════════════════════════════════

class PlanMejoraListSerializer(serializers.ModelSerializer):
    """Serializer ligero para listados."""
    origen_tipo_display = serializers.CharField(source='get_origen_tipo_display', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    criterio_codigo = serializers.CharField(source='criterio.codigo', read_only=True, default='')
    criterio_nombre = serializers.CharField(source='criterio.nombre', read_only=True, default='')
    autoevaluacion_numero = serializers.CharField(
        source='autoevaluacion.numero_autoevaluacion', read_only=True, default=''
    )
    auditoria_nombre = serializers.CharField(
        source='auditoria.auditoria_nombre', read_only=True, default=''
    )
    responsable_nombre = serializers.SerializerMethodField()
    esta_vencido = serializers.BooleanField(read_only=True)
    dias_restantes = serializers.IntegerField(read_only=True)
    proximo_a_vencer = serializers.BooleanField(read_only=True)
    hallazgos_count = serializers.SerializerMethodField()
    soportes_count = serializers.SerializerMethodField()

    class Meta:
        model = PlanMejora
        fields = [
            'id', 'numero_plan', 'descripcion',
            'origen_tipo', 'origen_tipo_display',
            'criterio_id', 'criterio_codigo', 'criterio_nombre',
            'autoevaluacion_id', 'autoevaluacion_numero',
            'auditoria_id', 'auditoria_nombre',
            'cumplimiento_id', 'resultado_indicador_id',
            'estado_cumplimiento_actual', 'objetivo_mejorado',
            'acciones_implementar',
            'responsable', 'responsable_nombre',
            'fecha_inicio', 'fecha_vencimiento', 'fecha_implementacion',
            'porcentaje_avance', 'estado', 'estado_display',
            'evidencia', 'observaciones',
            'esta_vencido', 'dias_restantes', 'proximo_a_vencer',
            'hallazgos_count', 'soportes_count',
            'fecha_creacion', 'fecha_actualizacion',
        ]

    def get_responsable_nombre(self, obj):
        if obj.responsable:
            nombre = f"{obj.responsable.first_name} {obj.responsable.last_name}".strip()
            return nombre or obj.responsable.username
        return None

    def get_hallazgos_count(self, obj):
        return obj.hallazgos.count()

    def get_soportes_count(self, obj):
        return obj.soportes.count()


class PlanMejoraDetailSerializer(PlanMejoraListSerializer):
    """Serializer completo para detalle, incluye hallazgos y soportes."""
    hallazgos = serializers.SerializerMethodField()
    soportes = SoportePlanSerializer(many=True, read_only=True)
    soportes_count = serializers.SerializerMethodField()
    origen_detalle = serializers.CharField(read_only=True)

    class Meta(PlanMejoraListSerializer.Meta):
        fields = PlanMejoraListSerializer.Meta.fields + [
            'hallazgos', 'soportes', 'soportes_count', 'origen_detalle',
        ]

    def get_hallazgos(self, obj):
        """Lista resumida de hallazgos asociados al plan."""
        from .serializers import HallazgoListSerializer
        return HallazgoListSerializer(obj.hallazgos.all(), many=True).data

    def get_soportes_count(self, obj):
        return obj.soportes.count()


class PlanMejoraCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer para crear/actualizar planes de mejora."""

    class Meta:
        model = PlanMejora
        fields = [
            'id',
            'numero_plan', 'descripcion',
            'origen_tipo',
            'cumplimiento', 'autoevaluacion', 'criterio',
            'auditoria', 'resultado_indicador',
            'estado_cumplimiento_actual', 'objetivo_mejorado',
            'acciones_implementar', 'responsable',
            'fecha_inicio', 'fecha_vencimiento', 'fecha_implementacion',
            'porcentaje_avance', 'estado',
            'evidencia', 'observaciones',
        ]

    def validate(self, data):
        """Validaciones de negocio."""
        fecha_inicio = data.get('fecha_inicio')
        fecha_vencimiento = data.get('fecha_vencimiento')

        if fecha_inicio and fecha_vencimiento:
            if fecha_vencimiento <= fecha_inicio:
                raise serializers.ValidationError({
                    'fecha_vencimiento': 'La fecha de vencimiento debe ser posterior a la fecha de inicio.'
                })

        porcentaje = data.get('porcentaje_avance', 0)
        estado = data.get('estado', 'PENDIENTE')

        if estado == 'COMPLETADO' and porcentaje < 100:
            raise serializers.ValidationError({
                'porcentaje_avance': 'El porcentaje debe ser 100% para marcar como completado.'
            })

        # Validar coherencia origen_tipo ↔ FK
        origen = data.get('origen_tipo')
        if origen == 'HABILITACION' and not data.get('autoevaluacion'):
            raise serializers.ValidationError({
                'autoevaluacion': 'Se requiere autoevaluación para planes de origen HABILITACION.'
            })
        elif origen == 'AUDITORIA' and not data.get('auditoria'):
            raise serializers.ValidationError({
                'auditoria': 'Se requiere auditoría para planes de origen AUDITORIA.'
            })
        elif origen == 'INDICADOR' and not data.get('resultado_indicador'):
            raise serializers.ValidationError({
                'resultado_indicador': 'Se requiere resultado de indicador para planes de origen INDICADOR.'
            })

        return data


class PlanMejoraResumenSerializer(serializers.Serializer):
    """Serializer para el resumen/estadísticas de planes."""
    total_planes = serializers.IntegerField()
    pendientes = serializers.IntegerField()
    en_curso = serializers.IntegerField()
    completados = serializers.IntegerField()
    vencidos = serializers.IntegerField()
    porcentaje_promedio_avance = serializers.FloatField()


# ═══════════════════════════════════════════════════════════════════
# HALLAZGO - SERIALIZERS
# ═══════════════════════════════════════════════════════════════════

class HallazgoListSerializer(serializers.ModelSerializer):
    """Serializer ligero para listados de hallazgos."""
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    severidad_display = serializers.CharField(source='get_severidad_display', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    origen_tipo_display = serializers.CharField(source='get_origen_tipo_display', read_only=True)
    criterio_codigo = serializers.CharField(source='criterio.codigo', read_only=True, default='')
    criterio_nombre = serializers.CharField(source='criterio.nombre', read_only=True, default='')
    plan_mejora_numero = serializers.CharField(
        source='plan_mejora.numero_plan', read_only=True, default=''
    )
    autoevaluacion_numero = serializers.CharField(
        source='autoevaluacion.numero_autoevaluacion', read_only=True, default=''
    )
    auditoria_nombre = serializers.CharField(
        source='auditoria.auditoria_nombre', read_only=True, default=''
    )

    class Meta:
        model = Hallazgo
        fields = [
            'id', 'numero_hallazgo', 'descripcion',
            'tipo', 'tipo_display',
            'severidad', 'severidad_display',
            'estado', 'estado_display',
            'origen_tipo', 'origen_tipo_display',
            'area_responsable',
            'autoevaluacion_id', 'autoevaluacion_numero',
            'datos_prestador_id',
            'auditoria_id', 'auditoria_nombre',
            'resultado_indicador_id',
            'criterio_id', 'criterio_codigo', 'criterio_nombre',
            'plan_mejora_id', 'plan_mejora_numero',
            'fecha_identificacion', 'fecha_cierre',
            'observaciones',
            'fecha_creacion', 'fecha_actualizacion',
        ]


class HallazgoDetailSerializer(HallazgoListSerializer):
    """Serializer completo para detalle de hallazgo."""
    origen_detalle = serializers.CharField(read_only=True)
    plan_mejora_detalle = serializers.SerializerMethodField()

    class Meta(HallazgoListSerializer.Meta):
        fields = HallazgoListSerializer.Meta.fields + [
            'origen_detalle', 'plan_mejora_detalle',
        ]

    def get_plan_mejora_detalle(self, obj):
        if obj.plan_mejora:
            return {
                'id': obj.plan_mejora.id,
                'numero_plan': obj.plan_mejora.numero_plan,
                'estado': obj.plan_mejora.estado,
                'porcentaje_avance': obj.plan_mejora.porcentaje_avance,
                'fecha_vencimiento': obj.plan_mejora.fecha_vencimiento,
            }
        return None


class HallazgoCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer para crear/actualizar hallazgos."""

    class Meta:
        model = Hallazgo
        fields = [
            'id',
            'numero_hallazgo', 'descripcion',
            'tipo', 'severidad', 'estado',
            'origen_tipo',
            'area_responsable',
            'autoevaluacion', 'datos_prestador',
            'auditoria', 'resultado_indicador',
            'criterio', 'plan_mejora',
            'fecha_identificacion', 'fecha_cierre',
            'observaciones',
        ]

    def validate(self, data):
        estado = data.get('estado')
        fecha_cierre = data.get('fecha_cierre')

        if estado == 'CERRADO' and not fecha_cierre:
            raise serializers.ValidationError({
                'fecha_cierre': 'Se requiere fecha de cierre para cerrar un hallazgo.'
            })

        # Validar coherencia origen_tipo ↔ FK
        origen = data.get('origen_tipo')
        if origen == 'HABILITACION' and not data.get('autoevaluacion'):
            raise serializers.ValidationError({
                'autoevaluacion': 'Se requiere autoevaluación para hallazgos de origen HABILITACION.'
            })
        elif origen == 'AUDITORIA' and not data.get('auditoria'):
            raise serializers.ValidationError({
                'auditoria': 'Se requiere auditoría para hallazgos de origen AUDITORIA.'
            })
        elif origen == 'INDICADOR' and not data.get('resultado_indicador'):
            raise serializers.ValidationError({
                'resultado_indicador': 'Se requiere resultado de indicador para hallazgos de origen INDICADOR.'
            })

        return data


class EstadisticasHallazgosSerializer(serializers.Serializer):
    """Serializer para estadísticas de hallazgos."""
    total_hallazgos = serializers.IntegerField()
    fortalezas = serializers.IntegerField()
    oportunidades_mejora = serializers.IntegerField()
    no_conformidades = serializers.IntegerField()
    hallazgos = serializers.IntegerField()
    abiertos = serializers.IntegerField()
    en_seguimiento = serializers.IntegerField()
    cerrados = serializers.IntegerField()
    criticos = serializers.IntegerField()

## ---
"""
mejoras/admin.py

Administración para Planes de Mejora y Hallazgos.
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import PlanMejora, Hallazgo, SoportePlan


class SoportePlanInline(admin.TabularInline):
    model = SoportePlan
    extra = 0
    readonly_fields = ['nombre_original', 'tamano_bytes', 'subido_por', 'fecha_subida']
    fields = ['archivo', 'nombre_original', 'tipo_soporte', 'descripcion', 'tamano_bytes', 'subido_por', 'fecha_subida']


@admin.register(SoportePlan)
class SoportePlanAdmin(admin.ModelAdmin):
    list_display = ['nombre_original', 'plan_mejora', 'tipo_soporte', 'tamano_legible_col', 'subido_por', 'fecha_subida']
    list_filter = ['tipo_soporte', 'fecha_subida']
    search_fields = ['nombre_original', 'descripcion', 'plan_mejora__numero_plan']
    readonly_fields = ['nombre_original', 'tamano_bytes', 'subido_por', 'fecha_subida']

    def tamano_legible_col(self, obj):
        return obj.tamano_legible
    tamano_legible_col.short_description = 'Tamaño'


@admin.register(PlanMejora)
class PlanMejoraAdmin(admin.ModelAdmin):
    list_display = [
        'numero_plan', 'descripcion_corta', 'origen_badge',
        'estado_badge', 'porcentaje_barra',
        'fecha_vencimiento', 'responsable',
    ]
    list_filter = ['origen_tipo', 'estado', 'fecha_vencimiento']
    search_fields = ['numero_plan', 'descripcion', 'acciones_implementar']
    readonly_fields = ['fecha_creacion', 'fecha_actualizacion']
    list_editable = ['fecha_vencimiento']
    date_hierarchy = 'fecha_creacion'
    list_per_page = 25
    inlines = [SoportePlanInline]

    fieldsets = (
        ('Identificación', {
            'fields': ('numero_plan', 'descripcion')
        }),
        ('Origen', {
            'fields': ('origen_tipo', 'cumplimiento', 'autoevaluacion',
                        'criterio', 'auditoria', 'resultado_indicador')
        }),
        ('Plan de Acción', {
            'fields': (
                'estado_cumplimiento_actual', 'objetivo_mejorado',
                'acciones_implementar', 'responsable',
            )
        }),
        ('Seguimiento', {
            'fields': (
                'fecha_inicio', 'fecha_vencimiento', 'fecha_implementacion',
                'porcentaje_avance', 'estado',
            )
        }),
        ('Evidencia y Notas', {
            'fields': ('evidencia', 'observaciones'),
            'classes': ('collapse',),
        }),
        ('Auditoría', {
            'fields': ('fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',),
        }),
    )

    def descripcion_corta(self, obj):
        return obj.descripcion[:60] + '...' if len(obj.descripcion) > 60 else obj.descripcion
    descripcion_corta.short_description = 'Descripción'

    def origen_badge(self, obj):
        colors = {
            'HABILITACION': '#2196F3',
            'AUDITORIA': '#FF9800',
            'INDICADOR': '#9C27B0',
        }
        color = colors.get(obj.origen_tipo, '#607D8B')
        return format_html(
            '<span style="background:{}; color:white; padding:3px 8px; '
            'border-radius:4px; font-size:11px;">{}</span>',
            color, obj.get_origen_tipo_display()
        )
    origen_badge.short_description = 'Origen'

    def estado_badge(self, obj):
        colors = {
            'PENDIENTE': '#FFC107',
            'EN_CURSO': '#2196F3',
            'COMPLETADO': '#4CAF50',
            'VENCIDO': '#F44336',
        }
        color = colors.get(obj.estado, '#607D8B')
        return format_html(
            '<span style="background:{}; color:white; padding:3px 8px; '
            'border-radius:4px; font-size:11px;">{}</span>',
            color, obj.get_estado_display()
        )
    estado_badge.short_description = 'Estado'

    def porcentaje_barra(self, obj):
        color = '#4CAF50' if obj.porcentaje_avance >= 80 else (
            '#FFC107' if obj.porcentaje_avance >= 40 else '#F44336'
        )
        return format_html(
            '<div style="width:100px; background:#e0e0e0; border-radius:4px;">'
            '<div style="width:{}px; background:{}; height:16px; border-radius:4px; '
            'text-align:center; color:white; font-size:11px; line-height:16px;">'
            '{}%</div></div>',
            obj.porcentaje_avance, color, obj.porcentaje_avance
        )
    porcentaje_barra.short_description = 'Avance'


@admin.register(Hallazgo)
class HallazgoAdmin(admin.ModelAdmin):
    list_display = [
        'numero_hallazgo', 'tipo_badge', 'severidad_badge',
        'estado_badge', 'origen_badge',
        'fecha_identificacion', 'plan_mejora',
    ]
    list_filter = ['origen_tipo', 'tipo', 'severidad', 'estado']
    search_fields = ['numero_hallazgo', 'descripcion', 'area_responsable']
    readonly_fields = ['fecha_creacion', 'fecha_actualizacion']
    date_hierarchy = 'fecha_identificacion'
    list_per_page = 25

    fieldsets = (
        ('Identificación', {
            'fields': ('numero_hallazgo', 'descripcion', 'tipo', 'severidad')
        }),
        ('Origen', {
            'fields': ('origen_tipo', 'autoevaluacion', 'datos_prestador',
                        'criterio', 'auditoria', 'resultado_indicador')
        }),
        ('Seguimiento', {
            'fields': ('area_responsable', 'estado', 'plan_mejora',
                        'fecha_identificacion', 'fecha_cierre')
        }),
        ('Notas', {
            'fields': ('observaciones',),
            'classes': ('collapse',),
        }),
        ('Auditoría', {
            'fields': ('fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',),
        }),
    )

    def tipo_badge(self, obj):
        colors = {
            'FORTALEZA': '#4CAF50',
            'OPORTUNIDAD_MEJORA': '#2196F3',
            'NO_CONFORMIDAD': '#F44336',
            'HALLAZGO': '#FF9800',
        }
        color = colors.get(obj.tipo, '#607D8B')
        return format_html(
            '<span style="background:{}; color:white; padding:3px 8px; '
            'border-radius:4px; font-size:11px;">{}</span>',
            color, obj.get_tipo_display()
        )
    tipo_badge.short_description = 'Tipo'

    def severidad_badge(self, obj):
        colors = {
            'BAJA': '#8BC34A',
            'MEDIA': '#FFC107',
            'ALTA': '#FF9800',
            'CRÍTICA': '#F44336',
        }
        color = colors.get(obj.severidad, '#607D8B')
        return format_html(
            '<span style="background:{}; color:white; padding:3px 8px; '
            'border-radius:4px; font-size:11px;">{}</span>',
            color, obj.get_severidad_display()
        )
    severidad_badge.short_description = 'Severidad'

    def estado_badge(self, obj):
        colors = {
            'ABIERTO': '#F44336',
            'EN_SEGUIMIENTO': '#2196F3',
            'CERRADO': '#4CAF50',
        }
        color = colors.get(obj.estado, '#607D8B')
        return format_html(
            '<span style="background:{}; color:white; padding:3px 8px; '
            'border-radius:4px; font-size:11px;">{}</span>',
            color, obj.get_estado_display()
        )
    estado_badge.short_description = 'Estado'

    def origen_badge(self, obj):
        colors = {
            'HABILITACION': '#2196F3',
            'AUDITORIA': '#FF9800',
            'INDICADOR': '#9C27B0',
        }
        color = colors.get(obj.origen_tipo, '#607D8B')
        return format_html(
            '<span style="background:{}; color:white; padding:3px 8px; '
            'border-radius:4px; font-size:11px;">{}</span>',
            color, obj.get_origen_tipo_display()
        )
    origen_badge.short_description = 'Origen'

## -----
"""
mejoras/urls.py

Rutas para los endpoints de planes de mejora y hallazgos.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import PlanMejoraViewSet, HallazgoViewSet

router = DefaultRouter()
router.register(r'planes-mejora', PlanMejoraViewSet, basename='plan-mejora')
router.register(r'hallazgos', HallazgoViewSet, basename='hallazgo')

urlpatterns = [
    path('', include(router.urls)),
]



