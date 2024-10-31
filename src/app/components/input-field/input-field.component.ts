import { Component,Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-field',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './input-field.component.html',
  styleUrl: './input-field.component.scss'
})
export class InputFieldComponent {
  @Input() label: string = '';
  @Input() name: string = '';
  @Input() id: string = '';
  @Input() placeholder: string = '';
  @Input() value: string = '';
  @Input() errorMessage: string = '';
  @Input() maxLength: number = 20;
  @Input() isRequired!: boolean;
  @Input() control: FormControl<string> = new FormControl()
}
