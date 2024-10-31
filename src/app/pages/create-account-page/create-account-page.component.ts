import { Component, computed, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CheckNamesService } from '../../Services/check-names.service';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { InputFieldComponent } from '../../components/input-field/input-field.component';
import { SelectFieldComponent } from '../../components/select-field/select-field.component';
import { TextAreaComponent } from '../../components/text-area/text-area.component';
import { CheckboxGroupComponent } from '../../components/checkbox-group/checkbox-group.component';
import {  CommonModule } from '@angular/common';
import { BehaviorSubject, Subject } from 'rxjs';
import { IndustryTypeResponseDTO, IndustryType, LocationResponseDTO, RLNoRequestModel, CompanyNameCheckRequestDTO } from '../../Models/company';
import { ErrorModalComponent } from "../../components/error-modal/error-modal.component";
// import { ErrorModalComponent } from '../../components/error-modal/error-modal.component';

@Component({
  selector: 'app-create-account-page',
  standalone: true,
  imports: [
    InputFieldComponent,
    SelectFieldComponent,
    TextAreaComponent,
    CheckboxGroupComponent,
    ReactiveFormsModule,
    CommonModule,
    ErrorModalComponent
],
  templateUrl: './create-account-page.component.html',
  styleUrls: ['./create-account-page.component.scss']
})
export class CreateAccountPageComponent implements OnInit {

  //new
  fieldsOrder: string[] = [];

  industries: BehaviorSubject<IndustryType[]> = new BehaviorSubject<IndustryType[]>([]);
  industryTypes: IndustryTypeResponseDTO[] = [];
  filteredIndustryTypes: IndustryTypeResponseDTO[] = [];

  countries: LocationResponseDTO[] = [];
  districts: LocationResponseDTO[] = [];
  thanas: LocationResponseDTO[] = [];
  outsideBd: boolean = false;  


  facilitiesForDisabilitiesControl = new FormControl(false);

  isPolicyAcceptedControl = new FormControl(false);

  isPolicyAccepted: boolean = this.isPolicyAcceptedControl.value!;

  
  disabilities = [
    { label: 'Accessible documentation and alternative formats', value: '1' },
    { label: 'Accessible Washrooms / Toilets', value: '2' },
    { label: 'Adapted Transport facility for Distant Travelling', value: '3' },
    { label: 'Assistive Software, communication and computer devices', value: '4' },
    { label: 'Available Flexible working shifts', value: '5' },
    { label: 'Offering Work from home', value: '6' },
    { label: 'Ramps or Lifts or Escalators for entry and move between floors', value: '7' },
    { label: 'Reasonable Accommodation in Recruitment/interview procedures like sign language, oral/typed/video interview', value: '8' },
    { label: 'Warning Indicators or Markers in place for hazards, staircase', value: '9' },
    { label: 'Workstation or seating adaptations for easy use', value: '10' }
  ];
  //

  employeeForm: FormGroup = new FormGroup({
    //new
    facilitiesForDisabilities: this.facilitiesForDisabilitiesControl,
    isPolicyAccepted: this.isPolicyAcceptedControl,
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
    companyNameBangla: new FormControl(''),
    yearsOfEstablishMent: new FormControl('', Validators.required),
    companySize: new FormControl('-1', Validators.required),
    outSideCity: new FormControl(''),
    businessDesc: new FormControl(''),
    tradeNo: new FormControl(''),
    webUrl: new FormControl(''),
    contactName: new FormControl('', [Validators.required]),
    contactDesignation: new FormControl('', [Validators.required]),
    contactEmail: new FormControl('', [Validators.required, Validators.email]),
    contactMobile: new FormControl(''),
    inclusionPolicy: new FormControl(''),
    support: new FormControl(''),
    disabilityWrap: new FormControl(''),
    //
    username: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]),
    companyName: new FormControl('', [Validators.required]),
    industryType: new FormControl(''),
    country: new FormControl('118'),  
    district: new FormControl(''),
    thana: new FormControl(''),
    cityName: new FormControl(''),
    companyAddress: new FormControl(''),
    companyAddressBangla: new FormControl(''),
    rlNo: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')])


  });
  

  // Signals for form control values
  usernameControl = computed(() => this.employeeForm.get('username') as FormControl<string>);
  companyNameControl = computed(() => this.employeeForm.get('companyName') as FormControl<string>);
  industryTypeControl = computed(() => this.employeeForm.get('industryType') as FormControl<string>);
  countryControl = computed(() => this.employeeForm.get('country') as FormControl<string>);
  districtControl = computed(() => this.employeeForm.get('district') as FormControl<string>);
  thanaControl = computed(() => this.employeeForm.get('thana') as FormControl<string>);
  rlNoControl = computed(() => this.employeeForm.get('rlno') as FormControl<string>);


  formControlSignals = computed(() => {
    const signals: { [key: string]: FormControl<any> } = {};
    Object.keys(this.employeeForm.controls).forEach(key => {
      signals[key] = this.employeeForm.get(key) as FormControl<any>;
    });
    return signals;
  });


  usernameExistsMessage: string = '';
  companyNameExistsMessage: string = '';
  isUniqueCompanyName: boolean = false;
  rlErrorMessage: string = '';
  showError: boolean = false;
  showErrorModal: boolean = false; 


  searchControl: FormControl = new FormControl(''); 

  private usernameSubject: Subject<string> = new Subject();
  private companyNameSubject: Subject<string> = new Subject();

  constructor(private checkNamesService: CheckNamesService) {}

  ngOnInit(): void {
    this.setupUsernameCheck();
    this.setupCompanyNameCheck();
    this.fetchIndustries();
    this.setupSearch();
    this.fetchIndustryTypes();
    this.fetchCountries();


    this.employeeForm.get('industryType')?.valueChanges.subscribe(selectedIndustryId => {
      this.onIndustryTypeChange(selectedIndustryId);
    });

    this.employeeForm.get('country')?.valueChanges.subscribe((value: string) => {
            if (value === '118') {
              this.outsideBd = false;  
              this.fetchDistricts();    
            } else {
              this.outsideBd = true;    
            }
          });

    this.employeeForm.get('district')?.valueChanges.subscribe(districtId => {
      if (districtId) {
        this.fetchThanas(districtId);
      }
    });
  }

  setupUsernameCheck(): void {
    const usernameControl = this.employeeForm.get('username') as FormControl;

    usernameControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.usernameSubject.next(value);
        this.checkUniqueUsername(value);
      });
  }


  
  setupCompanyNameCheck(): void {
    const companyNameControl = this.employeeForm.get('companyName') as FormControl;

    companyNameControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.companyNameSubject.next(value);
        this.checkUniqueCompanyName(value);
      });
  }


  private checkUniqueUsername(username: string): void {
    this.checkNamesService.checkUniqueUserName(username).subscribe({
      next: (response) => {
        console.log('API Response:', response); 
        this.usernameExistsMessage = response.message == 'Success!' ? '' : 'Username already exists';
      },
      error: (error) => {
        console.error('Error checking username:', error);
        this.usernameExistsMessage = 'This Username already exists. Try another.';
      }
    });
  }
  
  // Check for unique company name 
  private checkUniqueCompanyName(companyName: string): void {
    this.checkNamesService.checkUniqueCompanyName(companyName).subscribe({
      next: (response) => {
        console.log('API Response:', response);
        if (response.message == 'Success!') {
          this.isUniqueCompanyName = true;
          this.companyNameExistsMessage = '';
        }
        else{
          this.isUniqueCompanyName = false;
          this.companyNameExistsMessage = 'Company name already exists';
        }
      },
      error: (error) => {
        console.error('Error checking company name:', error);
        this.companyNameExistsMessage = 'Error checking company name';
      }
    });
  }

  // private checkUniqueCompanyName(companyName: string): void {
  //   this.checkNamesService.checkUniqueCompanyName(companyName).subscribe({
  //     next: (response) => {
  //       this.companyNameExistsMessage = response.message == 'Success!' ? '' : 'Company name already exists';
  //     },
  //     error: (error) => {
  //       console.error('Error checking company name:', error);
  //       this.companyNameExistsMessage = 'Error checking company name';
  //     }
  //   });
  // }

  // rl
  onRLNoBlur(): void {
    this.employeeForm.controls['rlNo'].markAsTouched();
  
    if (this.employeeForm.controls['rlNo'].valid) {
      this.verifyRLNo();  // Call the RLNo verification independently
    } else {
      this.showError = true;
      this.rlErrorMessage = 'RL Number is required';
      this.showErrorModal = true; 
    }
  }
  
  verifyRLNo(): void {
    const rlNo: string = this.employeeForm.get('rlNo')?.value.toString();
    const companyName: string = this.employeeForm.get('companyName')?.value.toString();
  
  
    if (rlNo) {
      const rlRequest: RLNoRequestModel = { RLNo: rlNo };

      const companyRequest: CompanyNameCheckRequestDTO = {
        UserName: '', 
        CheckFor: 'c',
        CompanyName: companyName
      };

      console.log(companyRequest.CompanyName)
      
  
      // this.checkNamesService.verifyRLNo(rlRequest).subscribe({
      //   next: (response: any) => {
      //     console.log('RL No Response:', response.company_Name === companyRequest.CompanyName); 
      //     console.log(response.company_Name)
      //     if (response.error === '0' ) {
      //       this.showError = false;
      //       this.rlErrorMessage = '';
      //       this.showErrorModal = false; 
      //     } else {
      //       this.showError = true;
      //       this.showErrorModal = true;
      //     }
      //   },
      //   error: () => {
      //     this.showError = true;
      //     this.showErrorModal = true;
      //   }
      // });

      this.checkNamesService.verifyRLNo(rlRequest).subscribe({
        next: (response: any) => {
          console.log('RL No Response:', response); // Debugging statement
          if (response.error === '0' && response.company_Name === companyRequest.CompanyName) {
            this.showError = false;
            this.rlErrorMessage = '';
            this.showErrorModal = false; // Hide modal on success
          } else {
            this.showError = true;
            this.showErrorModal = true; // Show modal on error
          }
        },
        error: () => {
          this.showError = true;
          this.showErrorModal = true; // Show modal for error message
        }
      });
    } else {
      this.showError = true;
      this.showErrorModal = true; 
    }
  }
  
  closeModal(): void {
    this.showErrorModal = false; 
  }
  
  

  // Fetch all industries
  fetchIndustries(): void {
    this.checkNamesService.getAllIndustryIds().pipe(
      map((response: any) => {
        if (response.error === '0') {
          return response.industryIds.map((industry: any) => ({
            IndustryId: industry.industryId,
            IndustryName: industry.industryName
          }));
        } else {
          throw new Error('Failed to fetch industries due to error in response');
        }
      })
    ).subscribe({
      next: (industries: IndustryType[]) => {
        this.industries.next(industries); 
      },
      error: (err) => console.error('Error fetching industry data', err)
    });
  }

   //Industry
  
   private fetchIndustryTypes(industryId: number = 0): void {
    this.checkNamesService.fetchIndustryTypes(industryId).subscribe({
      next: (response: any) => {
        if (response.error === "0") {
          const industryData = response.industryType || []; 
  
          if (Array.isArray(industryData) && industryData.length > 0) {
            this.industryTypes = industryData.map((item: any) => ({
              IndustryValue: item.industryValue,
              IndustryName: item.industryName
            }));
            this.filteredIndustryTypes = [...this.industryTypes];
            
          } else {
            console.error('No industry types found in the response.');
            this.industryTypes = []; 
          }
        } else {
          console.error('Unexpected error response:', response.error);
          this.industryTypes = []; 
        }
      },
      error: (error: any) => {
        console.error('Error fetching industry types:', error);
        this.industryTypes = []; 
      }
    });
  }
  // Trigger filtering of industries based on dropdown selection
  onIndustryTypeChange(selectedIndustryId: string | number): void {
    const parsedIndustryId = parseInt(selectedIndustryId as string, 10); 
    if (!isNaN(parsedIndustryId)) {
      this.fetchIndustryTypes(parsedIndustryId); 
    } else {
      this.filteredIndustryTypes = [...this.industryTypes];
    }
  }

  // Fetch countries (Outside Bangladesh included)
  private fetchCountries(): void {
    const requestPayload = { OutsideBd: '1', DistrictId: '' };

    this.checkNamesService.getLocations(requestPayload).subscribe({
      next: (response: any) => {
        console.log("Full response:", response);

        if (response?.error === '0') {  
          const countryData = response.bdDistrict || [];

          if (Array.isArray(countryData) && countryData.length > 0) {
            this.countries = countryData.map((item: any) => ({
              OptionValue: item.optionValue,  
              OptionText: item.optionText,
            }));
            this.employeeForm.get('country')?.setValue('118');
          } else {
            console.error('No countries found in the response.');
            this.countries = [];  
          }
        } else {
          console.error('Unexpected error response:', response?.error);
          this.countries = []; 
        }
      },
      error: (error: any) => {
        console.error('Error fetching countries:', error);
        this.countries = []; 
      }
    });
  }

// Fetch districts within Bangladesh
  private fetchDistricts(): void {
    const requestPayload = { OutsideBd: '0', DistrictId: '' };

    this.checkNamesService.getLocations(requestPayload).subscribe({
      next: (response: any) => {
        if (response?.error === "0") {
          const districtData = response.bdDistrict || [];
          this.districts = districtData.map((item: any) => ({
            OptionValue: item.optionValue,
            OptionText: item.optionText,
          }));
          this.thanas = []; 
        } else {
          this.districts = [];
        }
      },
      error: () => {
        this.districts = [];
      }
    });
  }

// Fetch thanas for the selected district
  private fetchThanas(districtId: string): void {
    const requestPayload = { OutsideBd: '0', DistrictId: districtId };

    this.checkNamesService.getLocations(requestPayload).subscribe({
      next: (response: any) => {
        if (response?.error === "0") {
          const thanaData = response.bdDistrict || [];
          this.thanas = thanaData.map((item: any) => ({
            OptionValue: item.optionValue,
            OptionText: item.optionText,
          }));
        } else {
          this.thanas = [];
        }
      },
      error: () => {
        this.thanas = [];
      }
    });
  }
  onCountryChange() {
    const selectedCountry = this.employeeForm.get('country')?.value;
    this.outsideBd = selectedCountry !== '118';
    if (this.outsideBd) {
      this.employeeForm.get('district')?.setValue('');
      this.employeeForm.get('thana')?.setValue('');
    }
  }
 
  setupSearch(): void {
    this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((query: string) => {
        this.filterIndustryTypes(query);
      });
  }

  getTypes(): IndustryTypeResponseDTO[] {
    return this.filteredIndustryTypes;
  }

  filterIndustryTypes(query: string): void {
    if (!query) {
      this.filteredIndustryTypes = [...this.industryTypes]; 
    } else {
      const lowerQuery = query.toLowerCase();
      this.filteredIndustryTypes = this.industryTypes.filter(type =>
        type.IndustryName.toLowerCase().includes(lowerQuery)
      );
    }
  }

  onCategoryChange(event: any): void {
    this.onIndustryTypeChange(event.target.value); 
  }

 
 


  formValue : any


currentValidationFieldIndex: number = 0;
isContinueClicked: boolean = false;

onContinue() {
  this.isContinueClicked = true; 

  const fieldsOrder = [
    'username', 
    'password',
    'confirmPassword',
    'companyName',
    'yearsOfEstablishMent',
    'companySize',
    'companyAddress',
    'companyAddressBangla',
    'contactName',
    'contactDesignation',
    'contactEmail'
  ];

  // Get the current field to be validated
  const currentField = fieldsOrder[this.currentValidationFieldIndex];
  const control = this.employeeForm.get(currentField);

  if (this.employeeForm.valid) {
    // If the form is fully valid, submit the form
    this.isPolicyAcceptedControl.setValue(true);
    this.formValue = this.employeeForm.value;
    console.log("Form submitted successfully!", this.formValue);
  } else if (control && control.invalid) {
    // If the current field is invalid, mark it as touched and show its error
    control.markAsTouched();

    // Log the current field's validation errors
    const errors = control.errors;
    console.log(`Field ${currentField} is invalid:`, errors);

    // Do not proceed to the next field until the current field is valid
    // Return here to stop further execution until this field is valid
    return;

  } else {
    // Move to the next field if the current one is valid
    this.currentValidationFieldIndex++;

    // Check if there are more fields to validate
    if (this.currentValidationFieldIndex < fieldsOrder.length) {
      // Mark the next field for validation
      const nextField = fieldsOrder[this.currentValidationFieldIndex];
      this.employeeForm.get(nextField)?.markAsTouched();
    } else {
      // If all fields are valid, submit the form
      this.isPolicyAcceptedControl.setValue(true);
      this.formValue = this.employeeForm.value;
      console.log("Form submitted successfully after validating all fields!", this.formValue);
    }
  }
}



}