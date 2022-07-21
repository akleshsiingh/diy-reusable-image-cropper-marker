import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DrawRectangleDirective } from './d/draw-rectangle.directive';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'ng-quote-price-from-image';

  isEditing = true;
  selectedIndex = -1;
  @ViewChild(DrawRectangleDirective) drawRectange!: DrawRectangleDirective;

  imageList: { img: string, width: number, height: number, x: number, y: number, price: string }[] = [];

  priceControl = new FormControl();

  constructor() { }

  ngOnDestroy(): void {
  }

  ngOnInit(): void {
   
  }


  async crop() {
    const imgInBase64: any = await this.drawRectange.doCropping();
    this.imageList.push(imgInBase64);
    console.log('imagein base64 => ', imgInBase64);
    if (this.imageList.length > 0) {
      this.selectedIndex = this.imageList.length - 1;
      this.priceControl.setValue('');
    }
  }


  showOnMainImage(image: { img: string, width: number, height: number, x: number, y: number }, index: number) {
    this.selectedIndex = index;
    this.priceControl.setValue(this.imageList[this.selectedIndex].price);
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

  addPrice() {
    const price = this.priceControl.value;
    console.log(`price ${price}`);
    this.imageList[this.selectedIndex].price = price;
    this.priceControl.setValue('');

  }

}
