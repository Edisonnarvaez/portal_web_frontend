#!/usr/bin/env node

/**
 * Entity Integration Validator
 * 
 * Valida que todas las entidades del módulo Habilitación estén correctamente integradas
 * a través de la arquitectura Clean Architecture.
 * 
 * Ejecución: npx ts-node validate-entities.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface EntityCheckResult {
  name: string;
  checks: {
    [key: string]: boolean;
  };
  issues: string[];
}

const HABILITACION_PATH = path.join(__dirname, 'src/apps/habilitacion');

const ENTITIES = [
  'DatosPrestador',
  'ServicioSede',
  'Autoevaluacion',
  'Cumplimiento',
  'Criterio',
  'Estandar',
  'PlanMejora',
  'Hallazgo',
  'SoporteDocumental',
];

const FILE_PATTERNS: { [key: string]: string } = {
  entity: 'domain/entities/{Name}.ts',
  service: 'application/services/{Name}Service.ts',
  repository: 'infrastructure/repositories/{Name}Repository.ts',
  repositoryInterface: 'domain/repositories/I{Name}Repository.ts',
  hook: 'presentation/hooks/use{Name}.ts',
};

/**
 * Convierte nombre de entidad al formato correcto para rutas
 */
function formatEntityName(name: string): string {
  return name;
}

/**
 * Verifica si un archivo existe
 */
function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

/**
 * Lee el contenido de un archivo
 */
function readFile(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return '';
  }
}

/**
 * Valida la presencia de un string en un archivo
 */
function fileContains(filePath: string, searchString: string): boolean {
  const content = readFile(filePath);
  return content.includes(searchString);
}

/**
 * Valida una entidad específica
 */
function validateEntity(entityName: string): EntityCheckResult {
  const result: EntityCheckResult = {
    name: entityName,
    checks: {
      entityExists: false,
      serviceExists: false,
      repositoryExists: false,
      repositoryInterfaceExists: false,
      hookExists: false,
      entityExported: false,
      serviceExported: false,
      repositoryExported: false,
      hookExported: false,
    },
    issues: [],
  };

  const formattedName = formatEntityName(entityName);

  // Verificar Entity
  const entityPath = path.join(HABILITACION_PATH, `domain/entities/${formattedName}.ts`);
  result.checks.entityExists = fileExists(entityPath);
  if (!result.checks.entityExists) {
    result.issues.push(`❌ Entity file not found: ${entityPath}`);
  }

  // Verificar Service
  const servicePath = path.join(HABILITACION_PATH, `application/services/${formattedName}Service.ts`);
  result.checks.serviceExists = fileExists(servicePath);
  if (!result.checks.serviceExists) {
    result.issues.push(`❌ Service file not found: ${servicePath}`);
  } else {
    // Verificar que el servicio extiende BaseHabilitacionService
    if (!fileContains(servicePath, 'BaseHabilitacionService')) {
      result.issues.push(`⚠️  Service does not extend BaseHabilitacionService: ${servicePath}`);
    }
  }

  // Verificar Repository
  const repositoryPath = path.join(HABILITACION_PATH, `infrastructure/repositories/${formattedName}Repository.ts`);
  result.checks.repositoryExists = fileExists(repositoryPath);
  if (!result.checks.repositoryExists) {
    result.issues.push(`❌ Repository file not found: ${repositoryPath}`);
  }

  // Verificar Repository Interface
  const repositoryInterfacePath = path.join(HABILITACION_PATH, `domain/repositories/I${formattedName}Repository.ts`);
  result.checks.repositoryInterfaceExists = fileExists(repositoryInterfacePath);
  if (!result.checks.repositoryInterfaceExists) {
    result.issues.push(`❌ Repository interface not found: ${repositoryInterfacePath}`);
  }

  // Verificar Hook
  const hookPath = path.join(HABILITACION_PATH, `presentation/hooks/use${formattedName}.ts`);
  result.checks.hookExists = fileExists(hookPath);
  if (!result.checks.hookExists) {
    result.issues.push(`❌ Hook file not found: ${hookPath}`);
  }

  // Verificar exportes en index.ts
  const entitiesIndexPath = path.join(HABILITACION_PATH, 'domain/entities/index.ts');
  result.checks.entityExported = fileExists(entitiesIndexPath) && fileContains(entitiesIndexPath, `from './${formattedName}'`);
  if (!result.checks.entityExported && fileExists(entitiesIndexPath)) {
    result.issues.push(`⚠️  Entity not exported in domain/entities/index.ts`);
  }

  const servicesIndexPath = path.join(HABILITACION_PATH, 'application/services/index.ts');
  result.checks.serviceExported = fileExists(servicesIndexPath) && fileContains(servicesIndexPath, `${formattedName}Service`);
  if (!result.checks.serviceExported && fileExists(servicesIndexPath)) {
    result.issues.push(`⚠️  Service not exported in application/services/index.ts`);
  }

  const repositoriesIndexPath = path.join(HABILITACION_PATH, 'infrastructure/repositories/index.ts');
  result.checks.repositoryExported = fileExists(repositoriesIndexPath) && fileContains(repositoriesIndexPath, `${formattedName}Repository`);
  if (!result.checks.repositoryExported && fileExists(repositoriesIndexPath)) {
    result.issues.push(`⚠️  Repository not exported in infrastructure/repositories/index.ts`);
  }

  const hooksIndexPath = path.join(HABILITACION_PATH, 'presentation/hooks/index.ts');
  result.checks.hookExported = fileExists(hooksIndexPath) && fileContains(hooksIndexPath, `use${formattedName}`);
  if (!result.checks.hookExported && fileExists(hooksIndexPath)) {
    result.issues.push(`⚠️  Hook not exported in presentation/hooks/index.ts`);
  }

  return result;
}

/**
 * Calcula el score de integración (0-10)
 */
function calculateIntegrationScore(result: EntityCheckResult): number {
  const totalChecks = Object.keys(result.checks).length;
  const passedChecks = Object.values(result.checks).filter(Boolean).length;
  return Math.round((passedChecks / totalChecks) * 10);
}

/**
 * Imprime el reporte de validación
 */
function printReport(results: EntityCheckResult[]): void {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 ENTITY INTEGRATION VALIDATION REPORT');
  console.log('='.repeat(80) + '\n');

  const totalEntities = results.length;
  let fullyIntegratedCount = 0;
  let partiallyIntegratedCount = 0;

  results.forEach((result) => {
    const score = calculateIntegrationScore(result);
    const status = score === 10 ? '✅' : score >= 7 ? '⚠️ ' : '❌';

    console.log(`${status} ${result.name.padEnd(20)} [${score}/10]`);

    if (score === 10) {
      fullyIntegratedCount++;
    } else if (score >= 7) {
      partiallyIntegratedCount++;
      result.issues.forEach((issue) => console.log(`   ${issue}`));
    } else {
      result.issues.forEach((issue) => console.log(`   ${issue}`));
    }

    console.log();
  });

  const totalScore = Math.round(
    (results.reduce((sum, r) => sum + calculateIntegrationScore(r), 0) / totalEntities)
  );

  console.log('='.repeat(80));
  console.log(`SUMMARY: ${fullyIntegratedCount}/${totalEntities} fully integrated [${totalScore}/10 overall]`);
  console.log('='.repeat(80) + '\n');

  // Recommendations
  if (totalScore < 10) {
    console.log('📋 RECOMMENDATIONS:');
    console.log('1. Create missing entity definition files');
    console.log('2. Implement Service classes extending BaseHabilitacionService');
    console.log('3. Create Repository implementations');
    console.log('4. Define Repository interfaces');
    console.log('5. Create custom React hooks');
    console.log('6. Add exports to index.ts files');
    console.log('\n');
  } else {
    console.log('✅ All entities are properly integrated!\n');
  }
}

/**
 * Punto de entrada
 */
function main(): void {
  console.log('Starting entity integration validation...\n');

  const results = ENTITIES.map(validateEntity);
  printReport(results);

  // Exit con código de error si hay problemas críticos
  const criticalIssues = results.some((r) => calculateIntegrationScore(r) < 5);
  process.exit(criticalIssues ? 1 : 0);
}

main();
