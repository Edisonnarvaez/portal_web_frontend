/**
 * Company Entity
 * Representa una empresa/institución en el sistema
 */

export type TipoDocumento = 'NIT' | 'CC' | 'CE' | 'PA' | 'PPT';
export type NaturalezaLegal = 'PUBLICA' | 'PRIVADA' | 'MIXTA';
export type ClaseEntidadSalud = 'IPS' | 'PROF' | 'PH' | 'PJ';

export interface Company {
  id: number;
  name: string;
  type_document: TipoDocumento;
  number_document: string;
  digit_verification?: string;
  legal_nature: NaturalezaLegal;
  region: number;
  municipality: number;
  code_authorize?: string;
  class_healthcare_entity: ClaseEntidadSalud;
  company_social_state: boolean;
  type_document_legal_representative: TipoDocumento;
  number_document_legal_representative: string;
  name_legal_representative: string;
  phone: string;
  address: string;
  contactEmail: string;
  documento_representante_legal?: string;
  foundationDate: string; // ISO date
  status: boolean;
  creationDate: string; // ISO datetime
  updateDate: string; // ISO datetime
}

export interface CompanyCreate {
  name: string;
  type_document: TipoDocumento;
  number_document: string;
  digit_verification?: string;
  legal_nature: NaturalezaLegal;
  region: number;
  municipality: number;
  code_authorize?: string;
  class_healthcare_entity: ClaseEntidadSalud;
  company_social_state?: boolean;
  type_document_legal_representative: TipoDocumento;
  number_document_legal_representative: string;
  name_legal_representative: string;
  phone: string;
  address: string;
  contactEmail: string;
  documento_representante_legal?: string;
  foundationDate: string;
}

export interface CompanyUpdate extends Partial<CompanyCreate> {
  id: number;
}
