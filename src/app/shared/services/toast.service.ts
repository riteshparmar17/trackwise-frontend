import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  id: number;
  type: 'success' | 'danger' | 'warning' | 'info';
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private messageSubject = new BehaviorSubject<ToastMessage[]>([]);

  messages$ = this.messageSubject.asObservable();

  success(message: string) {
    this.show(message, 'success');
  }

  error(message: string) {
    this.show(message, 'danger');
  }

  warning(message: string) {
    this.show(message, 'warning');
  }

  info(message: string) {
    this.show(message, 'info');
  }

  private show(text: string, type: ToastMessage['type']) {
    const toast: ToastMessage = {
      id: Date.now(),
      text,
      type
    };
    const message = this.messageSubject.value;
    this.messageSubject.next([...message, toast]);
    setTimeout(() => {
      this.remove(toast.id);
    }, 4000);
  }

  remove(id: number) {
    this.messageSubject.next(
      this.messageSubject.value.filter(msg => msg.id !== id)
    );
  }

}
