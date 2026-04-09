## app/audit
"""
audit/models/auditoria.py

Modelo principal de Auditoría con ciclo de vida completo.
Fases: PROGRAMADA → NOTIFICADA → EN_EJECUCION → INFORME → SEGUIMIENTO → CERRADA
"""
from django.db import models
from django.conf import settings
from django.utils import timezone
from companies.models.process import Process
from .tipo_auditoria import TipoAuditoria
from .entidad_auditoria import EntidadAuditoria


class Auditoria(models.Model):
    """
    Modelo principal de auditoría con ciclo de vida completo.
    Mantiene compatibilidad con campos existentes (auditoria_id como PK).
    """

    class Fase(models.TextChoices):
        PROGRAMADA = 'PROGRAMADA', 'Programada'
        NOTIFICADA = 'NOTIFICADA', 'Notificada'
        EN_EJECUCION = 'EN_EJECUCION', 'En Ejecución'
        INFORME = 'INFORME', 'Informe'
        SEGUIMIENTO = 'SEGUIMIENTO', 'Seguimiento'
        CERRADA = 'CERRADA', 'Cerrada'
        CANCELADA = 'CANCELADA', 'Cancelada'

    class Clasificacion(models.TextChoices):
        INTERNA = 'INTERNA', 'Interna'
        EXTERNA = 'EXTERNA', 'Externa'

    # ─── Identificación (campos originales preservados) ───
    auditoria_id = models.AutoField(primary_key=True, verbose_name="ID")
    auditoria_nombre = models.CharField(
        max_length=200, default="", verbose_name="Nombre de la auditoría"
    )
    auditoria_detalle = models.TextField(
        blank=True, default='', verbose_name="Objetivo / Alcance"
    )

    # ─── Clasificación ───
    clasificacion = models.CharField(
        max_length=10,
        choices=Clasificacion.choices,
        default=Clasificacion.INTERNA,
        verbose_name="Clasificación"
    )
    auditoria_tipo = models.ForeignKey(
        TipoAuditoria,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='auditorias',
        verbose_name="Tipo de auditoría"
    )
    auditoria_entidad = models.ForeignKey(
        EntidadAuditoria,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='auditorias',
        verbose_name="Entidad auditora"
    )

    # ─── Alcance ───
    auditoria_proceso = models.ForeignKey(
        Process,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='auditorias',
        verbose_name="Proceso auditado"
    )
    sede = models.ForeignKey(
        'companies.Headquarters',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='auditorias',
        verbose_name="Sede auditada"
    )
    norma_referencia = models.CharField(
        max_length=200, blank=True, default='',
        verbose_name="Norma de referencia",
        help_text="Ej: ISO 9001:2015, Resolución 3100/2019"
    )

    # ─── Ciclo de vida ───
    fase = models.CharField(
        max_length=15,
        choices=Fase.choices,
        default=Fase.PROGRAMADA,
        verbose_name="Fase actual"
    )
    auditoria_estado = models.BooleanField(
        default=True,
        verbose_name="Activa",
        help_text="Si está desactivada no aparece en listados activos"
    )

    # ─── Fechas del ciclo ───
    fecha_programada = models.DateField(
        null=True, blank=True,
        verbose_name="Fecha programada"
    )
    auditoria_fecha_notificacion = models.DateField(
        null=True, blank=True,
        verbose_name="Fecha de notificación"
    )
    fecha_inicio_ejecucion = models.DateField(
        null=True, blank=True,
        verbose_name="Fecha inicio ejecución"
    )
    auditoria_fecha_auditoria = models.DateField(
        null=True, blank=True,
        verbose_name="Fecha fin ejecución"
    )
    fecha_informe = models.DateField(
        null=True, blank=True,
        verbose_name="Fecha de informe"
    )
    fecha_cierre = models.DateField(
        null=True, blank=True,
        verbose_name="Fecha de cierre"
    )

    # ─── Equipo auditor ───
    auditor_lider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='auditorias_lider',
        verbose_name="Auditor líder"
    )
    auditoria_responsable = models.CharField(
        max_length=200, blank=True, default='',
        verbose_name="Responsable del proceso auditado"
    )

    # ─── Resultados ───
    conclusion = models.TextField(
        blank=True, default='',
        verbose_name="Conclusiones generales"
    )
    recomendaciones = models.TextField(
        blank=True, default='',
        verbose_name="Recomendaciones"
    )

    # ─── Relación ───
    auditoria_relacionada = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='auditorias_hijas',
        verbose_name="Auditoría de seguimiento a"
    )

    # ─── Auditoría de datos ───
    creado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='auditorias_creadas',
        verbose_name="Creado por"
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Auditoría"
        verbose_name_plural = "Auditorías"
        ordering = ['-fecha_creacion']
        indexes = [
            models.Index(fields=['fase']),
            models.Index(fields=['clasificacion']),
            models.Index(fields=['auditoria_tipo']),
            models.Index(fields=['fecha_programada']),
        ]

    def __str__(self):
        return f"AUD-{self.auditoria_id:04d} {self.auditoria_nombre}"

    # ─── Propiedades calculadas ───

    @property
    def esta_activa(self):
        return self.fase not in [self.Fase.CERRADA, self.Fase.CANCELADA]

    @property
    def dias_para_ejecucion(self):
        """Días restantes hasta la fecha programada."""
        if not self.fecha_programada:
            return None
        delta = (self.fecha_programada - timezone.now().date()).days
        return delta

    @property
    def duracion_dias(self):
        """Duración de la ejecución en días."""
        if self.fecha_inicio_ejecucion and self.auditoria_fecha_auditoria:
            return (self.auditoria_fecha_auditoria - self.fecha_inicio_ejecucion).days + 1
        return None

    @property
    def total_hallazgos(self):
        return self.hallazgos_auditoria.count()

    @property
    def total_no_conformidades(self):
        return self.hallazgos_auditoria.filter(tipo__in=['NC_MAYOR', 'NC_MENOR']).count()

    # ─── Transiciones de fase ───

    def puede_avanzar_a(self, nueva_fase):
        """Validar transiciones permitidas."""
        transiciones = {
            self.Fase.PROGRAMADA: [self.Fase.NOTIFICADA, self.Fase.CANCELADA],
            self.Fase.NOTIFICADA: [self.Fase.EN_EJECUCION, self.Fase.CANCELADA],
            self.Fase.EN_EJECUCION: [self.Fase.INFORME],
            self.Fase.INFORME: [self.Fase.SEGUIMIENTO, self.Fase.CERRADA],
            self.Fase.SEGUIMIENTO: [self.Fase.CERRADA],
            self.Fase.CERRADA: [],
            self.Fase.CANCELADA: [],
        }
        return nueva_fase in transiciones.get(self.fase, [])

    def avanzar_fase(self, nueva_fase):
        """Avanzar a la siguiente fase con validación."""
        if not self.puede_avanzar_a(nueva_fase):
            raise ValueError(
                f"No se puede avanzar de {self.fase} a {nueva_fase}. "
                f"Transiciones permitidas: {self._transiciones_permitidas()}"
            )
        self.fase = nueva_fase
        # Auto-rellenar fechas
        hoy = timezone.now().date()
        if nueva_fase == self.Fase.NOTIFICADA and not self.auditoria_fecha_notificacion:
            self.auditoria_fecha_notificacion = hoy
        elif nueva_fase == self.Fase.EN_EJECUCION and not self.fecha_inicio_ejecucion:
            self.fecha_inicio_ejecucion = hoy
        elif nueva_fase == self.Fase.INFORME and not self.fecha_informe:
            self.fecha_informe = hoy
            if not self.auditoria_fecha_auditoria:
                self.auditoria_fecha_auditoria = hoy
        elif nueva_fase == self.Fase.CERRADA and not self.fecha_cierre:
            self.fecha_cierre = hoy
        self.save()

    def _transiciones_permitidas(self):
        transiciones = {
            self.Fase.PROGRAMADA: ['NOTIFICADA', 'CANCELADA'],
            self.Fase.NOTIFICADA: ['EN_EJECUCION', 'CANCELADA'],
            self.Fase.EN_EJECUCION: ['INFORME'],
            self.Fase.INFORME: ['SEGUIMIENTO', 'CERRADA'],
            self.Fase.SEGUIMIENTO: ['CERRADA'],
            self.Fase.CERRADA: [],
            self.Fase.CANCELADA: [],
        }
        return transiciones.get(self.fase, [])


class MiembroEquipoAuditor(models.Model):
    """Miembros del equipo auditor de una auditoría."""

    class Rol(models.TextChoices):
        AUDITOR_LIDER = 'LIDER', 'Auditor Líder'
        AUDITOR = 'AUDITOR', 'Auditor'
        OBSERVADOR = 'OBSERVADOR', 'Observador'
        EXPERTO_TECNICO = 'EXPERTO', 'Experto Técnico'

    auditoria = models.ForeignKey(
        Auditoria,
        on_delete=models.CASCADE,
        related_name='equipo_auditor'
    )
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='participaciones_auditoria'
    )
    rol = models.CharField(
        max_length=15,
        choices=Rol.choices,
        default=Rol.AUDITOR
    )
    area_responsable = models.CharField(
        max_length=200, blank=True, default='',
        help_text="Área o proceso que tiene asignado auditar"
    )

    class Meta:
        db_table = 'audit_miembro_equipo'
        verbose_name = 'Miembro del equipo auditor'
        verbose_name_plural = 'Equipo auditor'
        unique_together = ('auditoria', 'usuario')

    def __str__(self):
        return f"{self.usuario} - {self.get_rol_display()} en {self.auditoria}"


class HallazgoAuditoria(models.Model):
    """
    Hallazgo identificado durante una auditoría.
    Se integra con mejoras/Hallazgo a través de FK opcional.
    """

    class TipoHallazgo(models.TextChoices):
        NO_CONFORMIDAD_MAYOR = 'NC_MAYOR', 'No Conformidad Mayor'
        NO_CONFORMIDAD_MENOR = 'NC_MENOR', 'No Conformidad Menor'
        OBSERVACION = 'OBSERVACION', 'Observación'
        OPORTUNIDAD_MEJORA = 'OPORTUNIDAD', 'Oportunidad de Mejora'
        FORTALEZA = 'FORTALEZA', 'Fortaleza'

    class Estado(models.TextChoices):
        IDENTIFICADO = 'IDENTIFICADO', 'Identificado'
        PLAN_ACCION = 'PLAN_ACCION', 'Con Plan de Acción'
        EN_SEGUIMIENTO = 'EN_SEGUIMIENTO', 'En Seguimiento'
        VERIFICADO = 'VERIFICADO', 'Verificado'
        CERRADO = 'CERRADO', 'Cerrado'

    auditoria = models.ForeignKey(
        Auditoria,
        on_delete=models.CASCADE,
        related_name='hallazgos_auditoria'
    )
    numero = models.CharField(
        max_length=30,
        verbose_name="Número de hallazgo"
    )
    tipo = models.CharField(
        max_length=15,
        choices=TipoHallazgo.choices,
        verbose_name="Tipo de hallazgo"
    )
    criterio_norma = models.CharField(
        max_length=200, blank=True, default='',
        verbose_name="Criterio / Numeral de norma",
        help_text="Requisito de la norma incumplido"
    )
    descripcion = models.TextField(
        verbose_name="Descripción del hallazgo"
    )
    evidencia_objetiva = models.TextField(
        blank=True, default='',
        verbose_name="Evidencia objetiva"
    )
    proceso_afectado = models.ForeignKey(
        Process,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='hallazgos_auditoria',
        verbose_name="Proceso afectado"
    )
    responsable_accion = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='hallazgos_asignados',
        verbose_name="Responsable de acción"
    )
    estado = models.CharField(
        max_length=15,
        choices=Estado.choices,
        default=Estado.IDENTIFICADO
    )
    fecha_limite_accion = models.DateField(
        null=True, blank=True,
        verbose_name="Fecha límite para acción"
    )
    fecha_verificacion = models.DateField(
        null=True, blank=True,
        verbose_name="Fecha de verificación"
    )

    # ─── Integración con mejoras ───
    hallazgo_mejora = models.ForeignKey(
        'mejoras.Hallazgo',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='hallazgos_auditoria_origen',
        help_text="Hallazgo vinculado en el módulo de mejoras"
    )
    plan_mejora = models.ForeignKey(
        'mejoras.PlanMejora',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='hallazgos_auditoria_origen',
        help_text="Plan de mejora asociado"
    )

    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'audit_hallazgo_auditoria'
        verbose_name = 'Hallazgo de auditoría'
        verbose_name_plural = 'Hallazgos de auditoría'
        ordering = ['numero']
        unique_together = ('auditoria', 'numero')

    def __str__(self):
        return f"{self.numero} - {self.get_tipo_display()}"

    @property
    def esta_vencido(self):
        if not self.fecha_limite_accion:
            return False
        return (
            self.fecha_limite_accion < timezone.now().date()
            and self.estado not in [self.Estado.VERIFICADO, self.Estado.CERRADO]
        )


class ActaReunion(models.Model):
    """
    Actas de las reuniones de apertura, cierre y seguimiento de la auditoría.
    """

    class TipoActa(models.TextChoices):
        APERTURA = 'APERTURA', 'Acta de Apertura'
        CIERRE = 'CIERRE', 'Acta de Cierre'
        SEGUIMIENTO = 'SEGUIMIENTO', 'Acta de Seguimiento'

    auditoria = models.ForeignKey(
        Auditoria,
        on_delete=models.CASCADE,
        related_name='actas'
    )
    tipo_acta = models.CharField(
        max_length=15,
        choices=TipoActa.choices,
    )
    fecha = models.DateField()
    lugar = models.CharField(max_length=200, blank=True, default='')
    asistentes = models.TextField(
        blank=True, default='',
        help_text="Lista de asistentes (uno por línea)"
    )
    temas_tratados = models.TextField(
        blank=True, default='',
        verbose_name="Temas tratados / Orden del día"
    )
    compromisos = models.TextField(
        blank=True, default='',
        verbose_name="Compromisos y acuerdos"
    )
    observaciones = models.TextField(blank=True, default='')
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'audit_acta_reunion'
        verbose_name = 'Acta de reunión'
        verbose_name_plural = 'Actas de reunión'
        ordering = ['-fecha']

    def __str__(self):
        return f"{self.get_tipo_acta_display()} - {self.auditoria}"


class ProgramaAuditoria(models.Model):
    """
    Programa anual de auditorías.
    Agrupa las auditorías planificadas para un período.
    """

    class Estado(models.TextChoices):
        BORRADOR = 'BORRADOR', 'Borrador'
        APROBADO = 'APROBADO', 'Aprobado'
        EN_EJECUCION = 'EN_EJECUCION', 'En Ejecución'
        COMPLETADO = 'COMPLETADO', 'Completado'

    nombre = models.CharField(
        max_length=200,
        verbose_name="Nombre del programa"
    )
    periodo = models.CharField(
        max_length=20,
        verbose_name="Período",
        help_text="Ej: 2026, 2026-S1"
    )
    descripcion = models.TextField(blank=True, default='')
    estado = models.CharField(
        max_length=15,
        choices=Estado.choices,
        default=Estado.BORRADOR
    )
    responsable = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='programas_auditoria'
    )
    fecha_aprobacion = models.DateField(null=True, blank=True)
    auditorias = models.ManyToManyField(
        Auditoria,
        blank=True,
        related_name='programas',
        verbose_name="Auditorías del programa"
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'audit_programa'
        verbose_name = 'Programa de auditoría'
        verbose_name_plural = 'Programas de auditoría'
        ordering = ['-periodo']

    def __str__(self):
        return f"{self.nombre} ({self.periodo})"

    @property
    def total_auditorias(self):
        return self.auditorias.count()

    @property
    def avance_porcentaje(self):
        total = self.auditorias.count()
        if total == 0:
            return 0
        cerradas = self.auditorias.filter(fase='CERRADA').count()
        return round((cerradas / total) * 100, 1)



"""
audit/models/entidad_auditoria.py
Catálogo de entidades auditoras.
"""
from django.db import models


class EntidadAuditoria(models.Model):
    """
    Catálogo de entidades que realizan auditorías.
    Para auditorías externas: ente contralor, aseguradora, certificadora, etc.
    Para internas: departamento, área, comité, etc.
    """
    entidad_id = models.AutoField(primary_key=True)
    nombre = models.CharField(
        max_length=150,
        unique=True,
        verbose_name="Nombre de la entidad"
    )
    tipo_entidad = models.CharField(
        max_length=30,
        choices=[
            ('ENTE_CONTROL', 'Ente de control'),
            ('CERTIFICADORA', 'Certificadora'),
            ('ASEGURADORA', 'Aseguradora'),
            ('CONSULTORA', 'Consultora'),
            ('INTERNA', 'Interna'),
            ('OTRA', 'Otra'),
        ],
        default='OTRA',
        verbose_name="Tipo de entidad"
    )
    contacto = models.CharField(
        max_length=200, blank=True, default='',
        verbose_name="Contacto"
    )
    telefono = models.CharField(
        max_length=50, blank=True, default='',
        verbose_name="Teléfono"
    )
    email = models.EmailField(blank=True, default='', verbose_name="Email")
    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre

    class Meta:
        db_table = "auditoria_entidadauditoria"
        verbose_name = "Entidad de auditoría"
        verbose_name_plural = "Entidades de auditoría"
        ordering = ['nombre']


"""
audit/models/tipo_auditoria.py
Catálogo de tipos de auditoría.
"""
from django.db import models


class TipoAuditoria(models.Model):
    """
    Catálogo de tipos de auditoría.
    Ejemplos: Interna, Externa, De habilitación, De calidad, ISO, Fiscal, etc.
    """
    tipo_id = models.AutoField(primary_key=True)
    nombre = models.CharField(
        max_length=100,
        unique=True,
        verbose_name="Nombre del tipo de auditoría"
    )
    descripcion = models.TextField(
        blank=True, default='',
        verbose_name="Descripción"
    )
    requiere_entidad_externa = models.BooleanField(
        default=False,
        help_text="¿Requiere entidad auditora externa?"
    )
    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre

    class Meta:
        db_table = "auditoria_tipoauditoria"
        verbose_name = "Tipo de auditoría"
        verbose_name_plural = "Tipos de auditoría"
        ordering = ['nombre']


## app/companies

from django.db import models
from django.core.exceptions import ValidationError

from .parameters import Region, Municipality

class Company(models.Model):
    CLASS_HEALTHCARE_ENTITY_CHOICES = [
        ('IPS', 'Institución Prestadora de Servicios'),
        ('PROF', 'Profesional de Salud'),
        ('PH', 'Persona Humana'),
        ('PJ', 'Persona Jurídica'),
    ]
    TYPE_DOCUMENT_CHOICES = [
        ('NIT', 'Número de Identificación Tributaria'),
        ('CC', 'Cédula de Ciudadanía'),
        ('CE', 'Cédula de Extranjería'),
        ('PA', 'Pasaporte'),
        ('PPT', 'Permiso de Permanencia Temporal')
    ]
    TYPE_LEGAL_NATURE_CHOICES = [
        ('PUBLICA', 'Pública'),
        ('PRIVADA', 'Privada'),
        ('MIXTA', 'Mixta')
    ]
    name = models.CharField(max_length=255)
    type_document = models.CharField(max_length=50,choices=TYPE_DOCUMENT_CHOICES,verbose_name="Tipo de Documento")
    number_document = models.CharField(max_length=50)
    digit_verification = models.CharField(max_length=10, blank=True, null=True)
    legal_nature = models.CharField(max_length=255,choices=TYPE_LEGAL_NATURE_CHOICES,verbose_name="Naturaleza Legal")
    
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='departamentos')
    municipality = models.ForeignKey(Municipality, on_delete=models.CASCADE, related_name='municipios')
    
    code_authorize = models.CharField(max_length=50, blank=True, null=True)
    class_healthcare_entity = models.CharField(max_length=10,choices=CLASS_HEALTHCARE_ENTITY_CHOICES,verbose_name="Clase de Entidad de Salud")
    company_social_state = models.BooleanField(default=False)
    type_document_legal_representative = models.CharField(max_length=50,choices=TYPE_DOCUMENT_CHOICES,verbose_name="Tipo de Documento del Representante Legal")
    number_document_legal_representative = models.CharField(max_length=50,verbose_name="Número de Documento del Representante Legal")
    name_legal_representative = models.CharField(max_length=255)
    # se cambio el nombre del legal_representative por el nombre completo del representante legal para evitar confusiones
    phone = models.CharField(max_length=50)
    address = models.CharField(max_length=255)
    contactEmail = models.EmailField()
    #cargue de soporte de documento del representante legal----------------------
    documento_representante_legal = models.FileField(
        upload_to='empresas/representantes_legales/',
        null=True, blank=True,
        help_text="Documento del representante legal"
    )

    foundationDate = models.DateField()
    status = models.BooleanField(default=True)  # Activo/Inactivo
    #date_autoevaluation = models.DateField(blank=True, null=True) # para que la entidad tenga el estado de activo  debe tener una autoevalucion vigente, por eso se agrega este campo para controlar la fecha de la última autoevaluación realizada por la entidad
    creationDate = models.DateField(auto_now_add=True)
    updateDate = models.DateField(auto_now=True)

    def clean(self):
        super().clean()
        if self.region_id and self.municipality_id and self.municipality.region_id != self.region_id:
            raise ValidationError(
                {'municipality': 'El municipio seleccionado no pertenece a la region elegida.'}
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)

    def __str__(self):
        return self.name


from django.db import models
from .company import Company

class Department(models.Model):
    name = models.CharField(max_length=255)
    departmentCode = models.CharField(max_length=50)
    company = models.ForeignKey(Company, on_delete=models.PROTECT, related_name='departments')
    description = models.TextField()
    status = models.BooleanField(default=True)  # Activo/Inactivo
    creationDate = models.DateField(auto_now_add=True)
    updateDate = models.DateField(auto_now=True)

    def __str__(self):
        return self.name



from django.db import models
from django.core.exceptions import ValidationError
from .company import Company, Region, Municipality

class Headquarters(models.Model):
    #habilitationCode = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    company = models.ForeignKey(Company, on_delete=models.PROTECT)
    region = models.ForeignKey(Region, on_delete=models.PROTECT)
    municipality = models.ForeignKey(Municipality, on_delete=models.PROTECT)
    address = models.CharField(max_length=100,null=True)

    concepto_sanitario = models.BooleanField(
        default=False, 
        help_text="Concepto sanitario vigente expedido por la autoridad competente"
    )
    reserva_agua_24h = models.BooleanField(
        default=False, 
        help_text="Obligatorio para servicios de urgencias e internación"
    )
    planta_electrica = models.BooleanField(
        default=False, 
        help_text="Fuente de energía de emergencia exigible para todos los servicios"
    )

    # Configuración de Sede (Res. 544/2023)
    es_domicilio_ong = models.BooleanField(
        default=False, 
        verbose_name="Sede es Domicilio (Cooperación/ONG)",
        help_text="Habilita el uso de domicilio como sede para organismos internacionales o ONGs"
    )

    status = models.BooleanField(default=True)  # Activo/Inactivo
    creationDate = models.DateField(auto_now_add=True)
    updateDate = models.DateField(auto_now=True)
    
    class Meta:
        verbose_name = "Sede Física"
        verbose_name_plural = "Sedes Físicas"

    def clean(self):
        super().clean()
        if self.region_id and self.municipality_id and self.municipality.region_id != self.region_id:
            raise ValidationError(
                {'municipality': 'El municipio seleccionado no pertenece a la region elegida.'}
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} - {self.municipality.name}"


from django.db import models

class Region(models.Model):
    code = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=255)
    def __str__(self):
        return f"{self.name} ({self.code})"
    
    
class Municipality(models.Model):
    code = models.CharField(max_length=10, unique=False)
    name = models.CharField(max_length=255)
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='Departamento')
    def __str__(self):
        return f"{self.name} ({self.code})"


from django.db import models
from users.models import User
from .company import Company

class ProcessType(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    company = models.ForeignKey(Company, on_delete=models.PROTECT)
    status = models.BooleanField(default=True)
    creationDate = models.DateField(auto_now_add=True)
    updateDate = models.DateField(auto_now=True)
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    

    def __str__(self):
        return self.name


from django.db import models

from .process_type import ProcessType
from .department import Department
from users.models import User

class Process(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    code = models.CharField(max_length=50)
    version = models.CharField(max_length=20)
    processType = models.ForeignKey(ProcessType, on_delete=models.PROTECT)
    department = models.ForeignKey(Department, on_delete=models.PROTECT)
    status = models.BooleanField(default=True)
    creationDate = models.DateField(auto_now_add=True)
    updateDate = models.DateField(auto_now=True)
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    

    def __str__(self):
        return self.name
    

## app/habilitacion

from datetime import date

from django.contrib.auth import get_user_model
from django.db import models
from django.utils import timezone

User = get_user_model()


class Autoevaluacion(models.Model):
    """Autoevaluacion anual de la IPS contra los criterios de la Resolucion 3100."""

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
        'DatosPrestador',
        on_delete=models.PROTECT,
        related_name='autoevaluaciones',
        verbose_name='Prestador',
    )
    periodo = models.IntegerField(choices=PERIODO_CHOICES, verbose_name='Periodo Fiscal')
    numero_autoevaluacion = models.CharField(
        max_length=50,
        verbose_name='Numero de Autoevaluacion',
        help_text='Identificador unico: AUT-CODIGO_REPS-PERIODO',
    )
    version = models.PositiveIntegerField(default=1, verbose_name='Version')
    fecha_inicio = models.DateField(auto_now_add=True, verbose_name='Fecha de Inicio')
    fecha_completacion = models.DateField(blank=True, null=True, verbose_name='Fecha de Completacion')
    fecha_vencimiento = models.DateField(
        blank=True,
        null=True,
        verbose_name='Fecha de Vencimiento',
        help_text='Fecha hasta la cual esta autoevaluacion es valida',
    )
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='BORRADOR', verbose_name='Estado')
    usuario_responsable = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='autoevaluaciones_responsable',
        verbose_name='Responsable',
    )
    observaciones = models.TextField(blank=True, null=True, verbose_name='Observaciones')
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creacion')
    fecha_actualizacion = models.DateTimeField(auto_now=True, verbose_name='Fecha de Actualizacion')

    class Meta:
        db_table = 'habilitacion_autoevaluacion'
        verbose_name = 'Autoevaluacion'
        verbose_name_plural = 'Autoevaluaciones'
        unique_together = ('datos_prestador', 'periodo', 'version')
        ordering = ['-periodo', '-version']
        indexes = [
            models.Index(fields=['datos_prestador', 'periodo']),
            models.Index(fields=['estado']),
        ]

    def __str__(self):
        return f'AUT-{self.datos_prestador.codigo_reps}-{self.periodo} v{self.version}'

    def save(self, *args, **kwargs):
        if not self.numero_autoevaluacion:
            self.numero_autoevaluacion = f'AUT-{self.datos_prestador.codigo_reps}-{self.periodo}'
        if not self.fecha_vencimiento and self.periodo:
            self.fecha_vencimiento = date(self.periodo, 12, 31)
        super().save(*args, **kwargs)

    def porcentaje_cumplimiento(self):
        total = self.cumplimientos.count()
        if total == 0:
            return 0
        cumplidos = self.cumplimientos.filter(cumple__in=['CUMPLE', 'PARCIALMENTE']).count()
        return round((cumplidos / total) * 100, 2)

    def esta_vigente(self):
        if not self.fecha_vencimiento:
            return False
        return self.fecha_vencimiento >= timezone.now().date()

from django.db import models


class CapacidadInstalada(models.Model):
    """Capacidad instalada reportada por servicio (REPS)."""

    TIPO_CHOICES = [
        ('AMBULANCIA', 'Ambulancias'),
        ('CAMA', 'Camas'),
        ('APOYO_TERAPEUTICO', 'Apoyo Terapeutico'),
        ('SALA', 'Salas'),
        ('OTRO', 'Otro'),
    ]

    servicio_sede = models.ForeignKey(
        'ServicioSede',
        on_delete=models.CASCADE,
        related_name='capacidades_instaladas',
        verbose_name='Servicio de Sede',
    )
    tipo_capacidad = models.CharField(max_length=30, choices=TIPO_CHOICES, verbose_name='Tipo de Capacidad')
    subtipo = models.CharField(max_length=120, blank=True, null=True, verbose_name='Subtipo')
    cantidad = models.PositiveIntegerField(default=0, verbose_name='Cantidad')
    unidad = models.CharField(max_length=40, blank=True, null=True, verbose_name='Unidad')
    observaciones = models.TextField(blank=True, null=True, verbose_name='Observaciones')
    activo = models.BooleanField(default=True, verbose_name='Activo')
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creacion')
    fecha_actualizacion = models.DateTimeField(auto_now=True, verbose_name='Fecha de Actualizacion')

    class Meta:
        db_table = 'habilitacion_capacidadinstalada'
        verbose_name = 'Capacidad Instalada'
        verbose_name_plural = 'Capacidades Instaladas'
        indexes = [
            models.Index(fields=['servicio_sede', 'tipo_capacidad']),
            models.Index(fields=['tipo_capacidad']),
        ]

    def __str__(self):
        return f'{self.servicio_sede.codigo_servicio} - {self.get_tipo_capacidad_display()} ({self.cantidad})'


import os
import uuid

from django.core.exceptions import ValidationError
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


def checklist_upload_path(instance, filename):
    """Ruta de soportes del checklist."""

    unique_name = f'{uuid.uuid4().hex[:12]}_{filename}'
    checklist_id = instance.checklist_item.checklist_id if instance.checklist_item_id else 'sin_checklist'
    return os.path.join('habilitacion', 'checklists', str(checklist_id), unique_name)


def validate_checklist_extension(value):
    ext = os.path.splitext(value.name)[1].lower()
    allowed_extensions = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg', '.xls', '.xlsx']
    if ext not in allowed_extensions:
        raise ValidationError(
            f'Extension "{ext}" no permitida. '
            f'Extensiones validas: {", ".join(allowed_extensions)}'
        )


class ChecklistItem(models.Model):
    """Item del checklist asociado a un requisito documental del Anexo 2."""

    checklist = models.ForeignKey(
        'ChecklistVerificacion',
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name='Checklist',
    )
    requisito = models.ForeignKey(
        'RequisitoDocumental',
        on_delete=models.PROTECT,
        related_name='items_checklist',
        verbose_name='Requisito',
    )
    obligatorio = models.BooleanField(default=True, verbose_name='Obligatorio')
    cumple = models.BooleanField(null=True, blank=True, verbose_name='Cumple')
    observaciones = models.TextField(blank=True, null=True, verbose_name='Observaciones')
    verificado_por = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='items_checklist_verificados',
        verbose_name='Verificado por',
    )
    fecha_verificacion = models.DateTimeField(blank=True, null=True, verbose_name='Fecha de Verificacion')
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creacion')
    fecha_actualizacion = models.DateTimeField(auto_now=True, verbose_name='Fecha de Actualizacion')

    class Meta:
        db_table = 'habilitacion_checklistitem'
        verbose_name = 'Item de Checklist'
        verbose_name_plural = 'Items de Checklist'
        unique_together = ('checklist', 'requisito')
        indexes = [
            models.Index(fields=['checklist', 'cumple']),
        ]

    def __str__(self):
        return f'{self.checklist.codigo_checklist} - {self.requisito.codigo}'


from django.contrib.auth import get_user_model
from django.db import transaction
from django.db import models

from .requisitoDocumental import RequisitoDocumental
from .checklistItem import ChecklistItem

User = get_user_model()


class ChecklistVerificacion(models.Model):
    """Checklist de verificacion documental para un tramite REPS."""

    ESTADO_CHOICES = [
        ('BORRADOR', 'Borrador'),
        ('EN_PROCESO', 'En Proceso'),
        ('COMPLETO', 'Completo'),
        ('CERRADO', 'Cerrado'),
    ]

    codigo_checklist = models.CharField(max_length=60, unique=True, verbose_name='Codigo Checklist')
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='BORRADOR', verbose_name='Estado')
    novedad = models.ForeignKey(
        'NovedadREPS',
        on_delete=models.CASCADE,
        related_name='checklists',
        verbose_name='Novedad REPS',
    )
    servicio_sede = models.ForeignKey(
        'ServicioSede',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='checklists_verificacion',
        verbose_name='Servicio de Sede',
    )
    responsable = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='checklists_verificacion',
        verbose_name='Responsable',
    )
    fecha_cierre = models.DateField(blank=True, null=True, verbose_name='Fecha de Cierre')
    observaciones = models.TextField(blank=True, null=True, verbose_name='Observaciones')
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creacion')
    fecha_actualizacion = models.DateTimeField(auto_now=True, verbose_name='Fecha de Actualizacion')

    class Meta:
        db_table = 'habilitacion_checklistverificacion'
        verbose_name = 'Checklist de Verificacion'
        verbose_name_plural = 'Checklists de Verificacion'
        ordering = ['-fecha_creacion']
        indexes = [
            models.Index(fields=['estado']),
            models.Index(fields=['novedad', 'estado']),
        ]

    def __str__(self):
        return f'{self.codigo_checklist} - {self.estado}'

    SUBTIPO_NOVEDAD_PREFIX_RULES = {
        'CAMBIO_CONTACTO': ['NOV-BAS', 'NOV-CON'],
        'CIERRE_MODALIDAD': ['NOV-BAS', 'NOV-CM'],
        'CAMBIO_HORARIO': ['NOV-BAS', 'NOV-HOR'],
        'CAMBIO_COMPLEJIDAD': ['NOV-BAS', 'NOV-CC'],
        'TRASLADO_SERVICIO': ['NOV-BAS', 'NOV-TS'],
        'OTRA': ['NOV-BAS'],
    }

    def get_tipos_tramite_objetivo(self):
        if self.novedad.tipo_novedad == 'PRESTADOR':
            return ['INSCRIPCION']

        tipos = ['NOVEDAD']

        if self.novedad.subtipo_novedad == 'REACTIVACION':
            tipos.append('VISITA_REACTIVACION')
        elif self.novedad.subtipo_novedad == 'APERTURA_MODALIDAD':
            tipos.append('VISITA_CERTIFICACION')

        if self.novedad.requiere_visita_previa:
            tipos.append('VISITA_PREVIA')

        return list(dict.fromkeys(tipos))

    def _aplicar_reglas_subtipo_novedad(self, requisitos):
        prefijos = self.SUBTIPO_NOVEDAD_PREFIX_RULES.get(self.novedad.subtipo_novedad)
        if not prefijos:
            return requisitos

        q_prefijos = models.Q()
        for prefijo in prefijos:
            q_prefijos |= models.Q(codigo__startswith=prefijo)

        return requisitos.filter(
            models.Q(tipo_tramite__in=['VISITA_PREVIA', 'VISITA_CERTIFICACION', 'VISITA_REACTIVACION'])
            | (models.Q(tipo_tramite='NOVEDAD') & q_prefijos)
            | models.Q(tipo_tramite='INSCRIPCION')
        )

    def get_requisitos_aplicables(self):
        tipos_tramite = self.get_tipos_tramite_objetivo()
        requisitos = RequisitoDocumental.objects.filter(
            tipo_tramite__in=tipos_tramite,
            activo=True,
        )

        requisitos = self._aplicar_reglas_subtipo_novedad(requisitos)
        return requisitos.order_by('codigo')

    def crear_items_desde_requisitos(self):
        requisitos = self.get_requisitos_aplicables()
        if not requisitos.exists():
            return 0

        existentes = set(self.items.values_list('requisito_id', flat=True))

        nuevos_items = [
            ChecklistItem(
                checklist=self,
                requisito=requisito,
                obligatorio=requisito.obligatorio,
            )
            for requisito in requisitos
            if requisito.id not in existentes
        ]

        if not nuevos_items:
            return 0

        with transaction.atomic():
            ChecklistItem.objects.bulk_create(nuevos_items, ignore_conflicts=True)

        return len(nuevos_items)

    def save(self, *args, **kwargs):
        es_nuevo = self._state.adding
        super().save(*args, **kwargs)
        if es_nuevo:
            self.crear_items_desde_requisitos()


import os
import uuid

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from normativity.models import Criterio
from processes.models import Documento
from soportes.models import SoporteDocumental

User = get_user_model()


class Cumplimiento(models.Model):
    """Registro de cumplimiento de un criterio especifico."""

    RESULTADO_CHOICES = [
        ('CUMPLE', 'Cumple'),
        ('NO_CUMPLE', 'No Cumple'),
        ('PARCIALMENTE', 'Parcialmente'),
        ('NO_APLICA', 'No Aplica'),
    ]

    autoevaluacion = models.ForeignKey(
        'Autoevaluacion',
        on_delete=models.PROTECT,
        related_name='cumplimientos',
        verbose_name='Autoevaluacion',
    )
    servicio_sede = models.ForeignKey(
        'ServicioSede',
        on_delete=models.PROTECT,
        related_name='cumplimientos',
        verbose_name='Servicio de Sede',
    )
    criterio = models.ForeignKey(Criterio, on_delete=models.PROTECT, related_name='cumplimientos', verbose_name='Criterio')
    cumple = models.CharField(max_length=20, choices=RESULTADO_CHOICES, verbose_name='Resultado de Cumplimiento')
    documentos = models.ManyToManyField(
        Documento,
        blank=True,
        related_name='cumplimientos_documentos',
        verbose_name='Documentos de Calidad',
    )
    soportes = models.ManyToManyField(
        SoporteDocumental,
        blank=True,
        related_name='cumplimientos_soportes',
        verbose_name='Soportes de Evidencia',
    )
    hallazgo = models.TextField(blank=True, null=True, verbose_name='Hallazgo/Observacion')
    plan_mejora = models.TextField(blank=True, null=True, verbose_name='Plan de Mejora')
    responsable_mejora = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cumplimientos_responsable',
        verbose_name='Responsable de Mejora',
    )
    fecha_compromiso = models.DateField(blank=True, null=True, verbose_name='Fecha Comprometida para Mejora')
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creacion')
    fecha_actualizacion = models.DateTimeField(auto_now=True, verbose_name='Fecha de Actualizacion')

    class Meta:
        db_table = 'habilitacion_cumplimiento'
        verbose_name = 'Cumplimiento'
        verbose_name_plural = 'Cumplimientos'
        unique_together = ('autoevaluacion', 'servicio_sede', 'criterio')
        indexes = [
            models.Index(fields=['autoevaluacion', 'cumple']),
            models.Index(fields=['criterio']),
        ]

    def __str__(self):
        return f'{self.autoevaluacion} - {self.criterio.codigo}: {self.cumple}'

    def tiene_plan_mejora(self):
        return self.plan_mejora and not self.fecha_compromiso

    def mejora_vencida(self):
        if not self.fecha_compromiso:
            return False
        return self.fecha_compromiso < timezone.now().date()

    @property
    def documentos_evidencia(self):
        """Alias de compatibilidad para clientes que aun consumen documentos_evidencia."""
        return self.documentos


ALLOWED_CHECKLIST_EXTENSIONS = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg', '.xls', '.xlsx']


def checklist_upload_path(instance, filename):
    """Ruta de soportes del checklist: media/habilitacion/checklists/<id>/<uuid>_archivo."""
    unique_name = f'{uuid.uuid4().hex[:12]}_{filename}'
    checklist_id = instance.checklist_item.checklist_id if instance.checklist_item_id else 'sin_checklist'
    return os.path.join('habilitacion', 'checklists', str(checklist_id), unique_name)


def validate_checklist_extension(value):
    """Valida extensiones permitidas para soportes documentales de checklist."""
    ext = os.path.splitext(value.name)[1].lower()
    if ext not in ALLOWED_CHECKLIST_EXTENSIONS:
        raise ValidationError(
            f'Extension "{ext}" no permitida. '
            f'Extensiones validas: {", ".join(ALLOWED_CHECKLIST_EXTENSIONS)}'
        )


from django.contrib.auth import get_user_model
from django.db import models
from django.utils import timezone

from companies.models import Company, Headquarters

User = get_user_model()


class DatosPrestador(models.Model):
    """Datos especificos de habilitacion vinculados a una sede."""

    CLASE_PRESTADOR_CHOICES = [
        ('IPS', 'Institucion Prestadora de Servicios'),
        ('PROF', 'Profesional de Salud'),
        ('PH', 'Persona Humana'),
        ('PJ', 'Persona Juridica'),
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
        verbose_name='Sede (Headquarters)',
    )
    company = models.ForeignKey(
        Company,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='prestadores_habilitados',
        verbose_name='Empresa',
    )
    codigo_reps = models.CharField(
        max_length=20,
        unique=True,
        verbose_name='Codigo REPS',
        help_text='Codigo de registro en REPS de la Superintendencia de Salud',
    )
    nombre_prestador = models.CharField(
        max_length=255,
        verbose_name='Nombre del Prestador',
        help_text='Nombre del prestador de servicios de salud',
    )
    sede_principal = models.BooleanField(
        default=False,
        verbose_name='Es Sede Principal',
        help_text='Indica si esta es la sede principal del prestador',
    )
    clase_prestador = models.CharField(
        max_length=10,
        choices=CLASE_PRESTADOR_CHOICES,
        verbose_name='Clase de Prestador',
    )
    estado_habilitacion = models.CharField(
        max_length=20,
        choices=ESTADO_HABILITACION_CHOICES,
        default='EN_PROCESO',
        verbose_name='Estado de Habilitacion',
    )
    fecha_inscripcion = models.DateField(blank=True, null=True, verbose_name='Fecha de Inscripcion en REPS')
    fecha_renovacion = models.DateField(blank=True, null=True, verbose_name='Fecha de Ultima Renovacion')
    fecha_vencimiento_habilitacion = models.DateField(
        blank=True,
        null=True,
        verbose_name='Fecha de Vencimiento de Habilitacion',
    )
    aseguradora_pep = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name='Aseguradora de Responsabilidad Civil',
    )
    numero_poliza = models.CharField(max_length=50, blank=True, null=True, verbose_name='Numero de Poliza')
    vigencia_poliza = models.DateField(blank=True, null=True, verbose_name='Vigencia de Poliza')
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creacion')
    fecha_actualizacion = models.DateTimeField(auto_now=True, verbose_name='Fecha de Actualizacion')
    usuario_responsable = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='datos_prestador_creado',
        verbose_name='Usuario Responsable',
    )

    class Meta:
        db_table = 'habilitacion_datosprestador'
        verbose_name = 'Datos de Prestador'
        verbose_name_plural = 'Datos de Prestadores'

    def __str__(self):
        return f'{self.codigo_reps} - {self.headquarters.name}'

    def clean(self):
        super().clean()
        if self.headquarters_id and self.company_id and self.headquarters.company_id != self.company_id:
            from django.core.exceptions import ValidationError

            raise ValidationError({'company': 'La empresa debe coincidir con la empresa de la sede seleccionada.'})

    def save(self, *args, **kwargs):
        if self.headquarters_id and not self.company_id:
            self.company_id = self.headquarters.company_id
        self.full_clean()
        super().save(*args, **kwargs)

    def dias_para_vencimiento(self):
        if not self.fecha_vencimiento_habilitacion:
            return None
        delta = self.fecha_vencimiento_habilitacion - timezone.now().date()
        return delta.days

    def esta_proxima_a_vencer(self, dias=90):
        dias_falta = self.dias_para_vencimiento()
        if dias_falta is None:
            return False
        return 0 <= dias_falta <= dias

    def esta_vencida(self):
        dias_falta = self.dias_para_vencimiento()
        if dias_falta is None:
            return False
        return dias_falta < 0


DatosSede = DatosPrestador


from django.contrib.auth import get_user_model
from django.db import models
import os

from .checklistItem import checklist_upload_path, validate_checklist_extension

User = get_user_model()


class EvidenciaChecklist(models.Model):
    """Evidencia documental cargada para cada item del checklist."""

    TIPO_CHOICES = [
        ('DOCUMENTO', 'Documento'),
        ('CERTIFICADO', 'Certificado'),
        ('ACTA', 'Acta'),
        ('OTRO', 'Otro'),
    ]

    checklist_item = models.ForeignKey(
        'ChecklistItem',
        on_delete=models.CASCADE,
        related_name='evidencias',
        verbose_name='Item de Checklist',
    )
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='DOCUMENTO', verbose_name='Tipo')
    nombre = models.CharField(max_length=255, blank=True, null=True, verbose_name='Nombre')
    archivo = models.FileField(
        upload_to=checklist_upload_path,
        validators=[validate_checklist_extension],
        verbose_name='Archivo',
    )
    hash_integridad = models.CharField(max_length=128, blank=True, null=True, verbose_name='Hash de Integridad')
    subido_por = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='evidencias_checklist_subidas',
        verbose_name='Subido por',
    )
    fecha_subida = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Subida')

    class Meta:
        db_table = 'habilitacion_evidenciachecklist'
        verbose_name = 'Evidencia de Checklist'
        verbose_name_plural = 'Evidencias de Checklist'
        ordering = ['-fecha_subida']

    def __str__(self):
        return self.nombre or os.path.basename(self.archivo.name)

    def save(self, *args, **kwargs):
        if self.archivo and not self.nombre:
            self.nombre = os.path.basename(self.archivo.name)
        super().save(*args, **kwargs)


from django.db import models


class MedidaSeguridadServicio(models.Model):
    """Medidas de seguridad aplicadas al servicio habilitado."""

    ESTADO_CHOICES = [
        ('ACTIVA', 'Activa'),
        ('LEVANTADA', 'Levantada'),
        ('EN_SEGUIMIENTO', 'En Seguimiento'),
    ]

    servicio_sede = models.ForeignKey(
        'ServicioSede',
        on_delete=models.CASCADE,
        related_name='medidas_seguridad',
        verbose_name='Servicio de Sede',
    )
    norma_referencia = models.CharField(
        max_length=120,
        default='Ley 9 de 1979 - Articulo 576',
        verbose_name='Norma de Referencia',
    )
    descripcion = models.TextField(verbose_name='Descripcion de la Medida')
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='ACTIVA', verbose_name='Estado')
    fecha_inicio = models.DateField(blank=True, null=True, verbose_name='Fecha de Inicio')
    fecha_fin = models.DateField(blank=True, null=True, verbose_name='Fecha de Fin')
    autoridad = models.CharField(max_length=200, blank=True, null=True, verbose_name='Autoridad')
    observaciones = models.TextField(blank=True, null=True, verbose_name='Observaciones')
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creacion')
    fecha_actualizacion = models.DateTimeField(auto_now=True, verbose_name='Fecha de Actualizacion')

    class Meta:
        db_table = 'habilitacion_medidaseguridad'
        verbose_name = 'Medida de Seguridad'
        verbose_name_plural = 'Medidas de Seguridad'
        indexes = [
            models.Index(fields=['servicio_sede', 'estado']),
            models.Index(fields=['estado']),
        ]

    def __str__(self):
        return f'{self.servicio_sede.codigo_servicio} - {self.estado}'

from django.contrib.auth import get_user_model
from django.db import models

from companies.models import Headquarters

User = get_user_model()


class NovedadREPS(models.Model):
    """Novedad reportada al REPS para prestador, sede, servicio o capacidad instalada."""

    TIPO_CHOICES = [
        ('PRESTADOR', 'Novedad del Prestador'),
        ('SEDE', 'Novedad de la Sede'),
        ('SERVICIO', 'Novedad de Servicios'),
        ('CAPACIDAD', 'Novedad de Capacidad Instalada'),
    ]

    SUBTIPO_CHOICES = [
        ('CAMBIO_CONTACTO', 'Cambio de datos de contacto'),
        ('REACTIVACION', 'Reactivacion del servicio'),
        ('APERTURA_MODALIDAD', 'Apertura de modalidad'),
        ('CIERRE_MODALIDAD', 'Cierre de modalidad'),
        ('CAMBIO_HORARIO', 'Cambio de horario de prestacion'),
        ('CAMBIO_COMPLEJIDAD', 'Cambio de complejidad'),
        ('TRASLADO_SERVICIO', 'Traslado de servicio'),
        ('OTRA', 'Otra'),
    ]

    ESTADO_CHOICES = [
        ('BORRADOR', 'Borrador'),
        ('RADICADA', 'Radicada'),
        ('EN_REVISION', 'En Revision'),
        ('APROBADA', 'Aprobada'),
        ('RECHAZADA', 'Rechazada'),
        ('APLICADA', 'Aplicada en REPS'),
    ]

    codigo_novedad = models.CharField(max_length=60, unique=True, verbose_name='Codigo de Novedad')
    tipo_novedad = models.CharField(max_length=20, choices=TIPO_CHOICES, verbose_name='Tipo de Novedad')
    subtipo_novedad = models.CharField(max_length=30, choices=SUBTIPO_CHOICES, verbose_name='Subtipo de Novedad')
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='BORRADOR', verbose_name='Estado')
    datos_prestador = models.ForeignKey(
        'DatosPrestador',
        on_delete=models.CASCADE,
        related_name='novedades_reps',
        verbose_name='Prestador',
    )
    sede = models.ForeignKey(
        Headquarters,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='novedades_reps',
        verbose_name='Sede',
    )
    servicio_sede = models.ForeignKey(
        'ServicioSede',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='novedades_reps',
        verbose_name='Servicio',
    )
    requiere_visita_previa = models.BooleanField(default=False, verbose_name='Requiere Visita Previa')
    fecha_radicacion = models.DateField(blank=True, null=True, verbose_name='Fecha de Radicacion')
    descripcion = models.TextField(blank=True, null=True, verbose_name='Descripcion')
    observaciones = models.TextField(blank=True, null=True, verbose_name='Observaciones')
    creado_por = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='novedades_reps_creadas',
        verbose_name='Creado por',
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creacion')
    fecha_actualizacion = models.DateTimeField(auto_now=True, verbose_name='Fecha de Actualizacion')

    class Meta:
        db_table = 'habilitacion_novedadreps'
        verbose_name = 'Novedad REPS'
        verbose_name_plural = 'Novedades REPS'
        ordering = ['-fecha_creacion']
        indexes = [
            models.Index(fields=['tipo_novedad', 'estado']),
            models.Index(fields=['datos_prestador', 'estado']),
        ]

    def __str__(self):
        return f'{self.codigo_novedad} - {self.get_tipo_novedad_display()}'


from django.db import models


class RequisitoDocumental(models.Model):
    """Catalogo de requisitos del Anexo 2 para inscripcion, novedades y visitas."""

    TIPO_TRAMITE_CHOICES = [
        ('INSCRIPCION', 'Inscripcion'),
        ('NOVEDAD', 'Novedad'),
        ('VISITA_PREVIA', 'Visita Previa'),
        ('VISITA_CERTIFICACION', 'Visita de Certificacion'),
        ('VISITA_REACTIVACION', 'Visita de Reactivacion'),
    ]

    codigo = models.CharField(max_length=30, unique=True, verbose_name='Codigo')
    nombre = models.CharField(max_length=255, verbose_name='Nombre')
    tipo_tramite = models.CharField(max_length=30, choices=TIPO_TRAMITE_CHOICES, verbose_name='Tipo de Tramite')
    descripcion = models.TextField(blank=True, null=True, verbose_name='Descripcion')
    obligatorio = models.BooleanField(default=True, verbose_name='Obligatorio')
    activo = models.BooleanField(default=True, verbose_name='Activo')
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creacion')
    fecha_actualizacion = models.DateTimeField(auto_now=True, verbose_name='Fecha de Actualizacion')

    class Meta:
        db_table = 'habilitacion_requisitodocumental'
        verbose_name = 'Requisito Documental'
        verbose_name_plural = 'Requisitos Documentales'
        ordering = ['codigo']
        indexes = [
            models.Index(fields=['tipo_tramite', 'activo']),
        ]

    def __str__(self):
        return f'{self.codigo} - {self.nombre}'


from django.db import models


class SancionServicio(models.Model):
    """Sanciones aplicadas al servicio habilitado."""

    TIPO_CHOICES = [
        ('PECUNIARIA', 'Pecuniaria'),
        ('TEMPORAL', 'Suspension Temporal'),
        ('DEFINITIVA', 'Cierre Definitivo'),
        ('OTRA', 'Otra'),
    ]

    ESTADO_CHOICES = [
        ('VIGENTE', 'Vigente'),
        ('CUMPLIDA', 'Cumplida'),
        ('REVOCADA', 'Revocada'),
    ]

    servicio_sede = models.ForeignKey(
        'ServicioSede',
        on_delete=models.CASCADE,
        related_name='sanciones',
        verbose_name='Servicio de Sede',
    )
    norma_referencia = models.CharField(
        max_length=120,
        default='Ley 9 de 1979 - Articulo 577',
        verbose_name='Norma de Referencia',
    )
    tipo_sancion = models.CharField(max_length=20, choices=TIPO_CHOICES, verbose_name='Tipo de Sancion')
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='VIGENTE', verbose_name='Estado')
    acto_administrativo = models.CharField(max_length=120, blank=True, null=True, verbose_name='Acto Administrativo')
    autoridad = models.CharField(max_length=200, blank=True, null=True, verbose_name='Autoridad')
    fecha_inicio = models.DateField(blank=True, null=True, verbose_name='Fecha de Inicio')
    fecha_fin = models.DateField(blank=True, null=True, verbose_name='Fecha de Fin')
    descripcion = models.TextField(blank=True, null=True, verbose_name='Descripcion')
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creacion')
    fecha_actualizacion = models.DateTimeField(auto_now=True, verbose_name='Fecha de Actualizacion')

    class Meta:
        db_table = 'habilitacion_sancionservicio'
        verbose_name = 'Sancion de Servicio'
        verbose_name_plural = 'Sanciones de Servicio'
        indexes = [
            models.Index(fields=['servicio_sede', 'estado']),
            models.Index(fields=['tipo_sancion']),
        ]

    def __str__(self):
        return f'{self.servicio_sede.codigo_servicio} - {self.get_tipo_sancion_display()}'

from django.db import models
from django.utils import timezone


class ServicioSede(models.Model):
    """Servicios de salud habilitados en una sede especifica."""

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
        'DatosPrestador',
        on_delete=models.PROTECT,
        related_name='servicios_salud',
        verbose_name='Prestador',
    )
    codigo_servicio = models.CharField(
        max_length=20,
        verbose_name='Codigo del Servicio',
        help_text='Codigo asignado por REPS para este servicio',
    )
    nombre_servicio = models.CharField(max_length=255, verbose_name='Nombre del Servicio')
    descripcion = models.TextField(blank=True, null=True, verbose_name='Descripcion del Servicio')
    modalidad = models.CharField(max_length=20, choices=MODALIDAD_CHOICES, verbose_name='Modalidad')
    complejidad = models.CharField(max_length=10, choices=COMPLEJIDAD_CHOICES, verbose_name='Complejidad')
    estado_habilitacion = models.CharField(
        max_length=20,
        choices=ESTADO_HABILITACION_CHOICES,
        default='EN_PROCESO',
        verbose_name='Estado de Habilitacion',
    )
    fecha_habilitacion = models.DateField(blank=True, null=True, verbose_name='Fecha de Habilitacion')
    fecha_vencimiento = models.DateField(blank=True, null=True, verbose_name='Fecha de Vencimiento')
    requiere_renovacion = models.BooleanField(default=False)
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creacion')
    fecha_actualizacion = models.DateTimeField(auto_now=True, verbose_name='Fecha de Actualizacion')

    class Meta:
        db_table = 'habilitacion_serviciosede'
        verbose_name = 'Servicio de Prestador'
        verbose_name_plural = 'Servicios de Prestador'
        unique_together = ('prestador', 'codigo_servicio')
        indexes = [
            models.Index(fields=['prestador', 'estado_habilitacion']),
            models.Index(fields=['estado_habilitacion']),
        ]

    def __str__(self):
        return f'{self.codigo_servicio} - {self.nombre_servicio}'

    def save(self, *args, **kwargs):
        if self.fecha_vencimiento:
            self.requiere_renovacion = self.fecha_vencimiento < timezone.now().date()
        else:
            self.requiere_renovacion = False
        super().save(*args, **kwargs)

    def dias_para_vencimiento(self):
        if not self.fecha_vencimiento:
            return None
        delta = self.fecha_vencimiento - timezone.now().date()
        return delta.days

    def esta_vencido(self):
        dias_falta = self.dias_para_vencimiento()
        if dias_falta is None:
            return False
        return dias_falta < 0


## app/indicators

from django.db import models
from companies.models.process import Process
from users.models import User

class Indicator(models.Model):
    FREQUENCY_CHOICES = [
        ('monthly', 'Mensual'),
        ('quarterly', 'Trimestral'),
        ('semiannual', 'Semestral'),
        ('annual', 'Anual'),
    ]

    CALCULATION_CHOICES = [
        ('percentage', 'Porcentaje'),
        ('rate_per_1000', 'Tasa por 1000'),
        ('rate_per_10000', 'Tasa por 10000'),
        ('average', 'Promedio'),
        ('ratio', 'Razón'),
    ]
    
    CLASS_CHOICES = [
        ('strategic', 'Estratégico'),
        ('mission-related', 'Misional'),
        ('regulatory', 'Normativo'),
        ('operational', 'Operativo'),
        ('tactical', 'Táctico'),
        ('support', 'Soporte'),
        ('other', 'Otro'),
    ]

    name = models.CharField(max_length=255)
    description = models.TextField()
    code = models.CharField(max_length=50)
    version = models.CharField(max_length=20)
    calculationMethod = models.CharField(max_length=50, choices=CALCULATION_CHOICES)  # Define el método de cálculo
    measurementUnit = models.CharField(max_length=255)
    numerator = models.TextField()
    numeratorResponsible = models.CharField(max_length=255)
    numeratorSource = models.CharField(max_length=255)
    numeratorDescription = models.TextField()
    denominator = models.TextField()
    denominatorResponsible = models.CharField(max_length=255)
    denominatorSource = models.CharField(max_length=255)
    denominatorDescription = models.TextField()
    classindicator = models.CharField(max_length=50, choices=CLASS_CHOICES)
    trend = models.CharField(max_length=50, choices=[('increasing', 'Creciente'), ('decreasing', 'Decreciente')]) #, ('stable', 'Estable')
    target = models.FloatField(max_length=255)
    author = models.CharField(max_length=255)
    process = models.ForeignKey(Process, on_delete=models.PROTECT)
    measurementFrequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)  # Periodicidad del indicador
    status = models.BooleanField(default=True)
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    creationDate = models.DateField(auto_now_add=True)
    updateDate = models.DateField(auto_now=True)

    def __str__(self):
        return self.name

from django.db import models
from companies.models.headquarters import Headquarters
from .indicator import Indicator
from users.models import User

class Result(models.Model):
    headquarters = models.ForeignKey(Headquarters, on_delete=models.PROTECT)
    indicator = models.ForeignKey(Indicator, on_delete=models.PROTECT)
    user = models.ForeignKey(User, on_delete=models.PROTECT)

    numerator = models.FloatField()
    denominator = models.FloatField()
    calculatedValue = models.FloatField(null=True, blank=True)

    creationDate = models.DateField(auto_now_add=True)
    updateDate = models.DateField(auto_now=True)

    year = models.PositiveIntegerField()

    month = models.PositiveIntegerField(null=True, blank=True)  # Solo para frecuencia mensual
    quarter = models.PositiveIntegerField(null=True, blank=True)  # Solo para frecuencia trimestral
    semester = models.PositiveIntegerField(null=True, blank=True)  # Solo para frecuencia semestral

    def calculate_indicator(self):
        calculation_type = self.indicator.calculationMethod.lower()

        if self.denominator == 0:
            self.calculatedValue = 0  # Evitar la división por cero
        else:
            # Cálculo según el método definido en el indicador
            if calculation_type == 'percentage':
                self.calculatedValue = self._calculate_percentage()
            elif calculation_type == 'rate_per_1000':
                self.calculatedValue = self._calculate_rate_per_1000()
            elif calculation_type == 'rate_per_10000':
                self.calculatedValue = self._calculate_rate_per_10000()
            elif calculation_type == 'average':
                self.calculatedValue = self._calculate_average()
            elif calculation_type == 'ratio':
                self.calculatedValue = self._calculate_ratio()
            else:
                self.calculatedValue = self._default_calculation()  # Si no coincide con ninguno, usa cálculo por defecto

        self.save()

    # Cálculos específicos según el tipo
    def _calculate_percentage(self):
        return (self.numerator / self.denominator) * 100

    def _calculate_rate_per_1000(self):
        return (self.numerator / self.denominator) * 1000

    def _calculate_rate_per_10000(self):
        return (self.numerator / self.denominator) * 10000

    def _calculate_average(self):
        return self.numerator / self.denominator

    def _calculate_ratio(self):
        return self.numerator / self.denominator

    def _default_calculation(self):
        return self.numerator / self.denominator  # Cálculo básico por defecto


## app/main

from django.db import models
from companies.models.headquarters import Headquarters

class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class Funcionario(TimeStampedModel):
    documento = models.CharField(max_length=20, unique=True)
    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    fecha_nacimiento = models.DateField()
    cargo = models.CharField(max_length=100)
    sede = models.ForeignKey(Headquarters, on_delete=models.PROTECT, related_name='sede_funcionarios')
    telefono = models.CharField(max_length=20)
    correo = models.EmailField(unique=True)
    foto = models.ImageField(upload_to='fotosFuncionarios/', null=True, blank=True)

    def __str__(self):
        return f"{self.nombres} {self.apellidos}"

class ContenidoInformativo(TimeStampedModel):
    TIPO_CHOICES = (
        ('noticia', 'Noticia'),
        ('comunicado', 'Comunicado'),
    )
    titulo = models.CharField(max_length=200)
    fecha = models.DateField()
    contenido = models.TextField()
    enlace = models.URLField(blank=True, null=True)
    urgente = models.BooleanField(default=False)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    imagen = models.ImageField(upload_to='imagenContenidoInformativo/', null=True, blank=True)

    def __str__(self):
        return f"{self.titulo} - {self.tipo}"

class Evento(TimeStampedModel):
    titulo = models.CharField(max_length=200)
    fecha = models.DateField()
    hora = models.TimeField()
    detalles = models.TextField()
    es_virtual = models.BooleanField(default=False)
    enlace = models.URLField(blank=True, null=True)
    lugar = models.CharField(max_length=255, blank=True, null=True)
    importante = models.BooleanField(default=False)

    def __str__(self):
        return self.titulo

class FelicitacionCumpleanios(TimeStampedModel):
    funcionario = models.ForeignKey(Funcionario, on_delete=models.CASCADE)
    mensaje = models.TextField()

    def __str__(self):
        return f"Feliz cumpleaños {self.funcionario.nombres}!"
    
class Reconocimiento(TimeStampedModel):
    funcionario = models.ForeignKey(Funcionario, on_delete=models.CASCADE, related_name="reconocimientos")
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField()
    fecha = models.DateField()
    tipo = models.CharField(max_length=100, blank=True, null=True)
    publicar = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.titulo} - {self.funcionario.nombres} {self.funcionario.apellidos}"

## app/mejoras

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

## app/normativity

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
    requiere_documento = models.BooleanField(
        default=False,
        verbose_name='Requiere documento de calidad'
    )
    requiere_soporte = models.BooleanField(
        default=False,
        verbose_name='Requiere soporte normativo'
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


## app/processes

from django.db import models
from django.core.exceptions import ValidationError
from companies.models.process import Process

# === Constantes para tipos y estados ===
TIPOS_DOCUMENTO = [
    ('FC', 'Ficha de caracterización'),
    ('MA', 'Matriz'),
    ('PR', 'Procedimiento'),
    ('DI', 'Documento interno'),
    ('GU', 'Guía'),
    ('PT', 'Protocolo'),
    ('PL', 'Plan'),
    ('IN', 'Instructivo'),
    ('FR', 'Formato'),
    ('DE', 'Documento externo'),
    ('RG', 'Registro'),
]

ESTADOS = [
    ('VIG', 'Vigente'),
    ('OBS', 'Obsoleto'),
]

# === Validaciones ===
def validar_archivo_oficial(file):
    ext = file.name.lower().split('.')[-1]
    if ext not in ['doc', 'docx', 'pdf', 'xls', 'xlsx', 'xlsb', 'xlsm']:
        raise ValidationError("El archivo oficial debe ser PDF o Excel (.xls, .xlsx, .xlsb, .xlsm)")

def validar_archivo_editable(file):
    ext = file.name.lower().split('.')[-1]
    if ext not in ['doc', 'docx', 'xls', 'xlsx', 'xlsb', 'xlsm']:
        raise ValidationError("El archivo editable debe ser Word o Excel (.doc, .docx, .xls, .xlsx, xlsb, xlsm)")

def validar_version(value):
    """Validar que la versión sea >= 0"""
    if value < 0:
        raise ValidationError("La versión debe ser mayor o igual a 0.")

# === Modelo principal ===
class Documento(models.Model):
    documento_padre = models.ForeignKey(
        'self', null=True, blank=True, on_delete=models.SET_NULL, related_name='versiones'
    )
    codigo_documento = models.CharField(max_length=50)
    nombre_documento = models.CharField(max_length=255)
    descripcion_documento = models.CharField(max_length=500, blank=True, null=True)
    proceso = models.ForeignKey(Process, on_delete=models.PROTECT)
    tipo_documento = models.CharField(max_length=3, choices=TIPOS_DOCUMENTO)
    version = models.IntegerField(validators=[validar_version])
    estado = models.CharField(max_length=3, choices=ESTADOS, default='VIG')
    activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    archivo_oficial = models.FileField(
        upload_to='documentos/oficiales/',
        validators=[validar_archivo_oficial],
        null=False,
        blank=False
    )
    archivo_editable = models.FileField(
        upload_to='documentos/editables/',
        validators=[validar_archivo_editable],
        null=True,
        blank=True
    )

    class Meta:
        unique_together = ('codigo_documento', 'version')
        indexes = [
            models.Index(fields=['codigo_documento']),
            models.Index(fields=['tipo_documento']),
            models.Index(fields=['estado']),
        ]

    def __str__(self):
        return f"{self.codigo_documento} v{self.version} - {self.nombre_documento}"

    def save(self, *args, **kwargs):
        """
        Override del método save para manejar automáticamente el estado de documentos padre
        """
        # Si es un documento nuevo (no tiene pk) y tiene documento_padre
        if not self.pk and self.documento_padre:
            # Marcar el documento padre como obsoleto
            self.documento_padre.estado = 'OBS'
            self.documento_padre.save(update_fields=['estado', 'fecha_actualizacion'])
            
            # Asegurar que el nuevo documento esté vigente
            self.estado = 'VIG'
            
            # Auto-incrementar la versión basada en el documento padre
            if not self.version:
                self.version = self.documento_padre.version + 1

        # Si es un documento nuevo sin padre, asegurar que esté vigente
        elif not self.pk and not self.documento_padre:
            self.estado = 'VIG'
            if not self.version:
                self.version = 0

        super().save(*args, **kwargs)

    def crear_nueva_version(self, **datos_actualizados):
        """
        Método helper para crear una nueva versión del documento
        """
        nueva_version = Documento(
            documento_padre=self,
            codigo_documento=self.codigo_documento,
            nombre_documento=datos_actualizados.get('nombre_documento', self.nombre_documento),
            descripcion_documento=datos_actualizados.get('descripcion_documento', self.descripcion_documento),
            proceso=datos_actualizados.get('proceso', self.proceso),
            tipo_documento=datos_actualizados.get('tipo_documento', self.tipo_documento),
            version=self.version + 1,
            estado='VIG',
            archivo_oficial=datos_actualizados.get('archivo_oficial'),
            archivo_editable=datos_actualizados.get('archivo_editable', self.archivo_editable),
        )
        nueva_version.save()
        return nueva_version

    def get_ultima_version(self):
        """
        Obtiene la última versión del documento
        """
        return self.versiones.order_by('-version').first()

    def get_version_vigente(self):
        """
        Obtiene la versión vigente del documento
        """
        return self.versiones.filter(estado='VIG').first()

    @classmethod
    def get_documentos_vigentes(cls):
        """
        Obtiene todos los documentos que están vigentes
        """
        return cls.objects.filter(estado='VIG', activo=True)

## app/soportes
from django.core.exceptions import ValidationError
from django.db import models, transaction
from django.db.models import Q, Max


# ==============================
# CATEGORÍA DE SOPORTE
# ==============================
class CategoriaSoporte(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True)
    activo = models.BooleanField(default=True)

    class Meta:
        db_table = 'soportes_categoriasoporte'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


# ==============================
# TIPO DE DOCUMENTO SOPORTE
# ==============================
class TipoDocumentoSoporte(models.Model):

    NIVEL_EMPRESA = 'EMPRESA'
    NIVEL_SEDE = 'SEDE'
    NIVEL_SERVICIO = 'SERVICIO'

    NIVEL_CHOICES = [
        (NIVEL_EMPRESA, 'Empresa'),
        (NIVEL_SEDE, 'Sede'),
        (NIVEL_SERVICIO, 'Servicio'),
    ]

    categoria = models.ForeignKey(
        CategoriaSoporte,
        on_delete=models.PROTECT,
        related_name='tipos_documento',
    )

    nombre = models.CharField(max_length=120)

    # 🔥 NIVEL PRO
    nivel_aplica = models.CharField(
        max_length=10,
        choices=NIVEL_CHOICES,
        null=True,      # 🔥 TEMPORAL
        blank=True      # 🔥 TEMPORAL
    )

    es_obligatorio = models.BooleanField(default=True)
    requiere_vencimiento = models.BooleanField(default=False)
    activo = models.BooleanField(default=True)

    class Meta:
        db_table = 'soportes_tipodocumentosoporte'
        unique_together = ('categoria', 'nombre')
        ordering = ['categoria__nombre', 'nombre']

    def __str__(self):
        return f'{self.categoria.nombre} - {self.nombre}'


# ==============================
# SOPORTE DOCUMENTAL (ARCHIVO)
# ==============================
class SoporteDocumental(models.Model):

    NIVEL_CHOICES = TipoDocumentoSoporte.NIVEL_CHOICES

    nivel = models.CharField(max_length=10, choices=NIVEL_CHOICES)

    empresa = models.ForeignKey(
        'companies.Company',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='soportes_documentales',
    )
    sede = models.ForeignKey(
        'companies.Headquarters',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='soportes_documentales',
    )
    servicio = models.ForeignKey(
        'habilitacion.ServicioSede',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='soportes_documentales',
    )

    tipo_documento = models.ForeignKey(
        TipoDocumentoSoporte,
        on_delete=models.PROTECT,
        related_name='soportes',
    )

    archivo = models.FileField(upload_to='habilitacion/soportes/')

    fecha_emision = models.DateField()
    fecha_vencimiento = models.DateField(null=True, blank=True)

    version = models.PositiveIntegerField(default=1)
    es_vigente = models.BooleanField(default=True)

    fecha_carga = models.DateTimeField(auto_now_add=True)
    observaciones = models.TextField(blank=True)

    class Meta:
        db_table = 'soportes_soportedocumental'
        ordering = ['-fecha_carga']
        indexes = [
            models.Index(fields=['nivel', 'es_vigente']),
            models.Index(fields=['tipo_documento', 'es_vigente']),
            models.Index(fields=['fecha_vencimiento']),
        ]

    def __str__(self):
        objetivo = self.empresa_id or self.sede_id or self.servicio_id
        return f'{self.tipo_documento.nombre} - {self.nivel} #{objetivo} v{self.version}'

    # ==============================
    # VALIDACIONES
    # ==============================
    def clean(self):
        super().clean()

        relaciones = [self.empresa_id, self.sede_id, self.servicio_id]
        relaciones_set = sum(1 for rel in relaciones if rel)

        if relaciones_set != 1:
            raise ValidationError(
                'Debe asociar exactamente una relación: empresa, sede o servicio.'
            )

        if self.nivel == 'EMPRESA' and not self.empresa_id:
            raise ValidationError({'empresa': 'Debe seleccionar empresa.'})

        if self.nivel == 'SEDE' and not self.sede_id:
            raise ValidationError({'sede': 'Debe seleccionar sede.'})

        if self.nivel == 'SERVICIO' and not self.servicio_id:
            raise ValidationError({'servicio': 'Debe seleccionar servicio.'})

        # 🔥 VALIDACIÓN PRO
        if self.tipo_documento.nivel_aplica != self.nivel:
            raise ValidationError(
                f'Este tipo de documento aplica a nivel {self.tipo_documento.nivel_aplica}'
            )

        # 🔥 VALIDACIÓN DE VENCIMIENTO
        if self.tipo_documento.requiere_vencimiento and not self.fecha_vencimiento:
            raise ValidationError(
                {'fecha_vencimiento': 'Este documento requiere fecha de vencimiento.'}
            )

    # ==============================
    # FILTRO DE CONTEXTO
    # ==============================
    def _scope_filter(self):
        if self.nivel == 'EMPRESA':
            return Q(nivel='EMPRESA', empresa_id=self.empresa_id)

        if self.nivel == 'SEDE':
            return Q(nivel='SEDE', sede_id=self.sede_id)

        return Q(nivel='SERVICIO', servicio_id=self.servicio_id)

    # ==============================
    # VERSIONAMIENTO AUTOMÁTICO
    # ==============================
    def save(self, *args, **kwargs):
        self.full_clean()

        with transaction.atomic():

            scope_q = self._scope_filter() & Q(tipo_documento_id=self.tipo_documento_id)

            existing = SoporteDocumental.objects.select_for_update().filter(scope_q)

            if self._state.adding:
                max_version = existing.aggregate(max_v=Max('version')).get('max_v') or 0
                self.version = max_version + 1

                if self.es_vigente:
                    existing.filter(es_vigente=True).update(es_vigente=False)

            else:
                if self.es_vigente:
                    existing.exclude(pk=self.pk).filter(es_vigente=True).update(es_vigente=False)

            super().save(*args, **kwargs)


# ==============================
# CHECKLIST AUTOMÁTICO
# ==============================
class SoporteRequerido(models.Model):

    ESTADO_CHOICES = [
        ('PENDIENTE', 'Pendiente'),
        ('CARGADO', 'Cargado'),
        ('VENCIDO', 'Vencido'),
    ]

    empresa = models.ForeignKey('companies.Company', null=True, blank=True, on_delete=models.CASCADE)
    sede = models.ForeignKey('companies.Headquarters', null=True, blank=True, on_delete=models.CASCADE)
    servicio = models.ForeignKey('habilitacion.ServicioSede', null=True, blank=True, on_delete=models.CASCADE)

    tipo_documento = models.ForeignKey(TipoDocumentoSoporte, on_delete=models.CASCADE)

    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='PENDIENTE')

    class Meta:
        db_table = 'soportes_soporterequerido'
        unique_together = ('empresa', 'sede', 'servicio', 'tipo_documento')

    def __str__(self):
        return f'{self.tipo_documento.nombre} - {self.estado}'

## app/users

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import pyotp
import qrcode
from io import BytesIO
from email.mime.image import MIMEImage
import os
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class App(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
            return self.name

class Role(models.Model):
    name = models.CharField(max_length=50) #, unique=True
    app = models.ForeignKey(App, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.name} ({self.app.name})"

class User(AbstractUser):
    #role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True)
    roles = models.ManyToManyField(Role, blank=True)
    otp_secret = models.CharField(max_length=32, null=True, blank=True)
    is_2fa_enabled = models.BooleanField(default=False)
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)  # Nuevo campo

    def generate_otp_secret(self):
        """Generate a new OTP secret key."""
        self.otp_secret = pyotp.random_base32()
        self.save()

    def verify_otp(self, code):
        """Verify the OTP code."""
        if not self.otp_secret:
            return False
        totp = pyotp.TOTP(self.otp_secret)
        return totp.verify(code)

    def get_totp_uri(self):
        """Get the OTP URI for QR code generation."""
        if not self.otp_secret:
            return None
        totp = pyotp.TOTP(self.otp_secret)
        return totp.provisioning_uri(
            name=self.email,  # Usa el email como identificador
            issuer_name="Portal de Gestion Institucional PILOT"  
        )

    def send_2fa_email(self, message, otp_secret=None, otp_uri=None, enabled=True):
        """Send 2FA setup/disable email with QR code if enabled."""
        logger.info(f"Preparando email 2FA para {self.email}, enabled: {enabled}")
        
        context = {
            'user': self,
            'message': message,
            'otp_secret': otp_secret,
            'enabled': enabled
        }

        try:
            html_content = render_to_string('emails/2fa_email.html', context)
            text_content = strip_tags(html_content)

            email = EmailMultiAlternatives(
                subject='Configuración de Autenticación en Dos Pasos',
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[self.email]
            )
            email.attach_alternative(html_content, "text/html")

            # Adjuntar logo
            logo_path = os.path.join(settings.BASE_DIR, 'users', 'templates', 'assets', 'logoslogan.png')
            if os.path.exists(logo_path):
                with open(logo_path, 'rb') as f:
                    logo = MIMEImage(f.read())
                    logo.add_header('Content-ID', '<logo_image>')
                    email.attach(logo)

            # Generar y adjuntar QR code SOLO si 2FA está siendo activado
            if enabled and otp_uri:
                logger.info("Generando código QR para 2FA")
                qr = qrcode.QRCode(version=1, box_size=10, border=5)
                qr.add_data(otp_uri)
                qr.make(fit=True)
                img = qr.make_image(fill_color="black", back_color="white")
                
                # Convertir imagen QR a bytes
                buffer = BytesIO()
                img.save(buffer, format='PNG')
                qr_image = MIMEImage(buffer.getvalue())
                qr_image.add_header('Content-ID', '<qr_code>')
                email.attach(qr_image)

            email.send()
            logger.info(f"Email 2FA enviado exitosamente a {self.email}")
            
        except Exception as e:
            logger.error(f"Error detallado al enviar email 2FA: {str(e)}")
            raise e
