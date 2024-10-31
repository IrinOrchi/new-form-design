export interface CompanyNameCheckRequestDTO {
    UserName: string; 
    CheckFor: string; 
    CompanyName: string; 
}

export interface CheckNamesResponseDTO {
    isUnique: boolean; 
    message: string; 
}
export interface IndustryTypeResponseDTO {
    IndustryValue: number;  
    IndustryName: string;   
  }
  
  export interface IndustryTypeRequestDTO {
    IndustryId?: number;  
    OrganizationText?: string;  
    CorporateID?: number;  
  }
  export interface LocationResponseDTO {
    OptionValue: string;
    OptionText: string;
  }
  
  export interface LocationRequestDTO {
    DistrictId: string;   // The district ID
    OutsideBd: string;    // Whether it's for Bangladesh or outside
  }
  export interface IndustryType{
    IndustryId: number;
    IndustryName: string;
}
export interface RLNoRequestModel {
  RLNo: string;
}


export interface RLNoResponseModel {
  error: string;
  rlNo: string;
  company_Name: string;
}