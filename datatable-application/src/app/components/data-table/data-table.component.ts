import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { DataService } from '../../services/data.service';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css']
})
export class DataTableComponent implements OnInit {
  comments: any[] = [];
  displayedComments: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number | 'all' = 10;
  totalItems: number = 0;
  searchControl: FormControl = new FormControl('');
  sortKey: string = '';
  sortDirection: string = '';
  loading: boolean = true;

  itemsPerPageOptions = [10, 15, 20, 'all'];
  selectedComment: any = null;

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.fetchComments();
    this.searchControl.valueChanges.pipe(debounceTime(300)).subscribe(value => {
      this.currentPage = 1;
      this.filterAndSortComments();
    });
  }

  fetchComments(): void {
    this.loading = true;
    this.dataService.getComments().subscribe((data) => {
      this.comments = data;
      this.totalItems = data.length;
      this.filterAndSortComments();
      this.loading = false;
    });
  }

  filterAndSortComments(): void {
    let filteredComments = this.comments.filter(comment => 
      comment.body.includes(this.searchControl.value) ||
      comment.email.includes(this.searchControl.value) ||
      comment.name.includes(this.searchControl.value)
    );

    if (this.sortKey) {
      filteredComments.sort((a, b) => {
        if (a[this.sortKey] < b[this.sortKey]) return this.sortDirection === 'asc' ? -1 : 1;
        if (a[this.sortKey] > b[this.sortKey]) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    if (this.itemsPerPage === 'all') {
      this.displayedComments = filteredComments;
    } else {
      this.displayedComments = filteredComments.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
    }
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.filterAndSortComments();
  }

  onItemsPerPageChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.itemsPerPage = value === 'all' ? 'all' : Number(value);
    this.currentPage = 1;
    this.filterAndSortComments();
  }

  onSortKeyChange(event: Event): void {
    this.sortKey = (event.target as HTMLSelectElement).value;
    this.currentPage = 1;
    this.filterAndSortComments();
  }

  onSortDirectionChange(event: Event): void {
    this.sortDirection = (event.target as HTMLSelectElement).value;
    this.currentPage = 1;
    this.filterAndSortComments();
  }

  editComment(comment: any): void {
    this.selectedComment = comment;
  }

  saveComment(updatedComment: any): void {
    this.comments = this.comments.map(comment =>
      comment.id === updatedComment.id ? updatedComment : comment
    );
    this.filterAndSortComments();
    this.selectedComment = null;
  }

  closeModal(): void {
    this.selectedComment = null;
  }

  deleteComment(id: number): void {
    this.comments = this.comments.filter(comment => comment.id !== id);
    this.filterAndSortComments();
  }

  hasNextPage(): boolean {
    return this.itemsPerPage === 'all' ? false : this.currentPage * this.itemsPerPage < this.totalItems;
  }
}
