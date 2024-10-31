import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal',
  template: `
    <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="bg-white rounded-lg p-6 shadow-lg w-full max-w-lg relative">
        <button class="absolute top-0 right-0 mt-2 mr-2 text-gray-600" (click)="close.emit()">
          &times;
        </button>
        <ng-content></ng-content>
      </div>
    </div>
  `,
  standalone: true,
})
export class ModalComponent {
  @Output() close = new EventEmitter<void>();
}
