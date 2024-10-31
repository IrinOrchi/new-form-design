import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-checkbox-group',
  standalone: true,
  imports:[ReactiveFormsModule],
  templateUrl: './checkbox-group.component.html',
  styleUrls: ['./checkbox-group.component.scss']
})
export class CheckboxGroupComponent {
  @Input() items: { label: string, value: string }[] = [];
  @Input() selectedCategory: string = '';
  @Input() searchQuery: string = '';
  @Input() control: FormControl<string> = new FormControl()
  
  // @Input() control!: FormControl;

  getFilteredItems() {
    let filteredItems = this.selectedCategory === 'Others' || this.selectedCategory === ''
      ? this.items
      : this.items.filter(item => item.value === this.selectedCategory);

    if (this.searchQuery) {
      filteredItems = filteredItems.filter(item =>
        item.label.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    return filteredItems;
  }
}