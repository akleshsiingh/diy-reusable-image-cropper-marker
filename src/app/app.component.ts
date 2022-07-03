import { Component, ViewChild } from '@angular/core';
import { DrawRectangleDirective } from './d/draw-rectangle.directive';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ng-quote-price-from-image';

  isEditing = true;
  @ViewChild(DrawRectangleDirective) drawRectange!: DrawRectangleDirective;

  imageList: { img: string, width: number, height: number, x: number, y: number }[] = [];

  constructor() { }


  async crop() {
    const imgInBase64: any = await this.drawRectange.doCropping();
    this.imageList.push(imgInBase64);
    console.log('imagein base64 => ', imgInBase64);
  }


  showOnMainImage(image: { img: string, width: number, height: number, x: number, y: number }) {
    this.drawRectange.markThis(image);
  }

  showAll() {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.drawRectange.enableEditMode();
    } else {
      this.drawRectange.showAll(this.imageList);
    }
  }

}
