import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  @Input() comment: any;
  @Output() save = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  tempComment: any = {};

  ngOnChanges(): void {
    this.tempComment = { ...this.comment };
  }

  saveChanges(): void {
    this.save.emit(this.tempComment);
  }

  closeModal(): void {
    this.close.emit();
  }
}
