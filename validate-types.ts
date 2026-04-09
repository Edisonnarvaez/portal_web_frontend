#!/usr/bin/env node

/**
 * Type Alignment Validator
 * 
 * Valida que las interfaces TypeScript se alineen con:
 * 1. Las enumeraciones del backend Django
 * 2. La estructura esperada de tipos
 * 3. Las relaciones entre entidades
 */

import * as fs from 'fs';
import * as path from 'path';

interface TypeIssue {
  entity: string;
  type: 'enum-mismatch' | 'missing-field' | 'type-mismatch' | 'relationship-error';
  severity: 'critical' | 'warning' | 'info';
  message: string;
}

interface ModelField {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

interface EntityModel {
  name: string;
  fields: ModelField[];
  relationships: {
    [key: string]: {
      type: 'one-to-many' | 'many-to-one' | 'one-to-one';
      targetEntity: string;
    };
  };
}

/**
 * Define expected models from Django backend
 * Este debe coincidir exactamente con: backend/apps/habilitacion/models.py
 */
const BACKEND_MODELS: { [key: string]: EntityModel } = {
  DatosPrestador: {
    name: 'DatosPrestador',
    fields: [
      { name: 'id', type: 'number', required: true },
      { name: 'razon_social', type: 'string', required: true },
      { name: 'nit', type: 'string', required: true, description: 'Unique NIT identifier' },
      { name: 'naturaleza_juridica', type: 'NaturalezaJuridica', required: true },
      { name: 'codigo_habilitacion', type: 'string', required: true },
      { name: 'estado', type: 'EstadoHabilitacionPrestador', required: true },
      { name: 'fecha_inicio', type: 'string', required: true, description: 'ISO date format' },
      { name: 'fecha_vencimiento', type: 'string', required: false },
      { name: 'activo', type: 'boolean', required: true },
      { name: 'created_at', type: 'string', required: true },
      { name: 'updated_at', type: 'string', required: true },
    ],
    relationships: {
      servicios: {
        type: 'one-to-many',
        targetEntity: 'ServicioSede',
      },
      sedes: {
        type: 'one-to-many',
        targetEntity: 'Headquarter',
      },
    },
  },
  ServicioSede: {
    name: 'ServicioSede',
    fields: [
      { name: 'id', type: 'number', required: true },
      { name: 'codigo_servicio', type: 'string', required: true },
      { name: 'nombre', type: 'string', required: true },
      { name: 'modalidad', type: 'ModalidadServicio', required: true },
      { name: 'complejidad', type: 'ComplejidadServicio', required: true },
      { name: 'estado', type: 'EstadoHabilitacionServicio', required: true },
      { name: 'fecha_vencimiento', type: 'string', required: false },
      { name: 'prestador_id', type: 'number', required: true },
      { name: 'created_at', type: 'string', required: true },
      { name: 'updated_at', type: 'string', required: true },
    ],
    relationships: {
      prestador: {
        type: 'many-to-one',
        targetEntity: 'DatosPrestador',
      },
      soportes: {
        type: 'one-to-many',
        targetEntity: 'SoporteDocumental',
      },
    },
  },
  SoporteDocumental: {
    name: 'SoporteDocumental',
    fields: [
      { name: 'id', type: 'number', required: true },
      { name: 'tipo_documento', type: 'TipoDocumentoSoporte', required: true },
      { name: 'version', type: 'number', required: true },
      { name: 'es_vigente', type: 'boolean', required: true },
      { name: 'fecha_vencimiento', type: 'string', required: false },
      { name: 'archivo_url', type: 'string', required: true },
      { name: 'servicio_id', type: 'number', required: true },
      { name: 'created_at', type: 'string', required: true },
      { name: 'updated_at', type: 'string', required: true },
    ],
    relationships: {
      servicio: {
        type: 'many-to-one',
        targetEntity: 'ServicioSede',
      },
    },
  },
};

/**
 * Backend enum values - must match Django choices exactly
 */
const BACKEND_ENUMS: { [key: string]: string[] } = {
  ModalidadServicio: ['INTRAMURAL', 'AMBULATORIA', 'TELEMEDICINA', 'URGENCIAS', 'AMBULANCIA'],
  ComplejidadServicio: ['BAJA', 'MEDIA', 'ALTA'],
  EstadoHabilitacionServicio: ['HABILITADO', 'EN_PROCESO', 'SUSPENDIDO', 'NO_HABILITADO', 'CANCELADO'],
  EstadoHabilitacionPrestador: ['HABILITADA', 'EN_PROCESO', 'SUSPENDIDA', 'NO_HABILITADA', 'CANCELADA'],
  NaturalezaJuridica: ['PUBICA', 'PRIVADA', 'MIXTA', 'COOPERATIVA'],
  TipoDocumentoSoporte: ['LICENCIA', 'CERTIFICADO', 'ACREDITACION', 'SOPORTE_TECNICO', 'OTRO'],
};

const HABILITACION_PATH = path.join(__dirname, 'src/apps/habilitacion');

/**
 * Lee archivo TypeScript y extrae tipos
 */
function readTypeDefinitions(filePath: string): { [key: string]: string } {
  const content = fs.readFileSync(filePath, 'utf-8');
  const types: { [key: string]: string } = {};

  // Simple regex para encontrar type/interface definitions
  const typeRegex = /(?:type|interface)\s+(\w+)\s*=?\s*([^;]+);?/g;
  let match;

  while ((match = typeRegex.exec(content)) !== null) {
    types[match[1]] = match[2].trim();
  }

  return types;
}

/**
 * Valida las enumeraciones
 */
function validateEnums(): TypeIssue[] {
  const issues: TypeIssue[] = [];
  const enumsPath = path.join(HABILITACION_PATH, 'domain/enums/index.ts');

  if (!fs.existsSync(enumsPath)) {
    issues.push({
      entity: 'Global',
      type: 'enum-mismatch',
      severity: 'critical',
      message: `Enums file not found: ${enumsPath}`,
    });
    return issues;
  }

  const content = fs.readFileSync(enumsPath, 'utf-8');

  // Validar cada enum
  for (const [enumName, values] of Object.entries(BACKEND_ENUMS)) {
    const missingValues: string[] = [];

    for (const value of values) {
      if (!content.includes(`'${value}'`) && !content.includes(`"${value}"`)) {
        missingValues.push(value);
      }
    }

    if (missingValues.length > 0) {
      issues.push({
        entity: enumName,
        type: 'enum-mismatch',
        severity: 'critical',
        message: `Missing enum values: ${missingValues.join(', ')} in ${enumName}`,
      });
    }
  }

  return issues;
}

/**
 * Valida la integridad de modelos en entidades
 */
function validateModelIntegrity(): TypeIssue[] {
  const issues: TypeIssue[] = [];

  for (const [entityName, model] of Object.entries(BACKEND_MODELS)) {
    const entityPath = path.join(HABILITACION_PATH, `domain/entities/${entityName}.ts`);

    if (!fs.existsSync(entityPath)) {
      issues.push({
        entity: entityName,
        type: 'missing-field',
        severity: 'critical',
        message: `Entity file not found: ${entityPath}`,
      });
      continue;
    }

    const content = fs.readFileSync(entityPath, 'utf-8');

    // Validar que todos los campos requeridos existan
    for (const field of model.fields) {
      if (!content.includes(field.name)) {
        issues.push({
          entity: entityName,
          type: 'missing-field',
          severity: field.required ? 'critical' : 'warning',
          message: `Missing required field: ${field.name} in ${entityName}`,
        });
      }
    }

    // Validar relaciones
    for (const [relName, rel] of Object.entries(model.relationships)) {
      if (!content.includes(rel.targetEntity)) {
        issues.push({
          entity: entityName,
          type: 'relationship-error',
          severity: 'warning',
          message: `Missing relationship definition: ${relName} → ${rel.targetEntity} in ${entityName}`,
        });
      }
    }
  }

  return issues;
}

/**
 * Imprime el reporte
 */
function printReport(issues: TypeIssue[]): void {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 TYPE ALIGNMENT VALIDATION REPORT');
  console.log('='.repeat(80) + '\n');

  if (issues.length === 0) {
    console.log('✅ All types are correctly aligned!\n');
    return;
  }

  const criticalIssues = issues.filter((i) => i.severity === 'critical');
  const warningIssues = issues.filter((i) => i.severity === 'warning');
  const infoIssues = issues.filter((i) => i.severity === 'info');

  if (criticalIssues.length > 0) {
    console.log('🚨 CRITICAL ISSUES:');
    criticalIssues.forEach((issue) => {
      console.log(`   [${issue.entity}] ${issue.message}`);
    });
    console.log();
  }

  if (warningIssues.length > 0) {
    console.log('⚠️  WARNING ISSUES:');
    warningIssues.forEach((issue) => {
      console.log(`   [${issue.entity}] ${issue.message}`);
    });
    console.log();
  }

  if (infoIssues.length > 0) {
    console.log('ℹ️  INFO:');
    infoIssues.forEach((issue) => {
      console.log(`   [${issue.entity}] ${issue.message}`);
    });
    console.log();
  }

  console.log('='.repeat(80));
  console.log(`SUMMARY: ${criticalIssues.length} critical, ${warningIssues.length} warnings`);
  console.log('='.repeat(80) + '\n');
}

/**
 * Punto de entrada
 */
function main(): void {
  console.log('Starting type alignment validation...\n');

  const enumIssues = validateEnums();
  const modelIssues = validateModelIntegrity();

  const allIssues = [...enumIssues, ...modelIssues];

  printReport(allIssues);

  process.exit(allIssues.some((i) => i.severity === 'critical') ? 1 : 0);
}

main();
