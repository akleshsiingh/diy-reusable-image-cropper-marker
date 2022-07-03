import { AfterViewInit, Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appDrawRectangle]'
})
export class DrawRectangleDirective implements AfterViewInit {

  @Input('appDrawRectangle') assetUrl: string = '';

  private isEditActive = true;
  private lens: any;
  private dismissBtn: any;
  private resizerDiv: any;
  private isLeftButtonIsPressed = false;
  private startPositionX = 0;
  private startPositionY = 0;

  private endPositionX = 0;
  private endPositionY = 0;

  private lensDrawComplete = false;
  private lenStart: { x: number, y: number } = { x: 0, y: 0 };
  newStartX: number = 0;
  newStartY: number = 0;
  private isLensGrabbed = false;
  lensWidth: number = 0;
  lensHeight: number = 0;
  private resizerWidth = 10;
  private resizerHeight = 15;

  private isResizerGrabbed = false;

  private imgWidth = 0;
  private imgHeight = 0;
  private imgNaturalWidth: number = 0;
  private imgNaturalHeight: number = 0;
  private mainImage: any;
  private markedLens: any[] = [];

  constructor(private el: ElementRef, private render2: Renderer2) {
    // el.nativeElement.s
    this.render2.setStyle(el.nativeElement, 'backgroundColor', 'purple');
    this.render2.setStyle(el.nativeElement, 'position', 'relative');
    this.render2.setStyle(el.nativeElement, 'userSelect', 'none');
  }

  ngAfterViewInit(): void {
    const img = this.el.nativeElement.querySelector('img');
    img.onload = () => {
      this.calculateImageSizes(img);
    }

    this.mainImage = img;
  }

  enableEditMode() {
    this.removeAllMarkers();
    this.isEditActive = true;
  }

  disableEdit() {
    this.isEditActive = false;
  }

  private calculateImageSizes(img: any) {
    this.imgWidth = img.clientWidth;
    this.imgHeight = img.clientHeight;

    this.imgNaturalWidth = img.naturalWidth;
    this.imgNaturalHeight = img.naturalHeight;

    console.log('calculate image sizes');

    this.dismissRectangle();
  }

  private debounce(fn: any, timout: number = 100) {
    let timer: any;
    return function (...args: any) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(null, args), timout);
    }
  }

  db = this.debounce(() => this.calculateImageSizes(this.mainImage), 100);

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (!!this.mainImage) {
      // this.calculateImageSizes(this.mainImage);
      this.db();

    }
  }


  @HostListener('mousedown', ['$event']) onMouseDown($event: MouseEvent) {
    if ($event.which === 1 && this.isEditActive) {
      const position = this.getCursorPos($event)
      this.isLeftButtonIsPressed = true;
      if (!!this.dismissBtn && $event.target === this.dismissBtn) {
        this.dismissRectangle();
      } else if ($event.target === this.resizerDiv) {
        this.isResizerGrabbed = true;
      }
      else if (!!this.lensDrawComplete) {

        this.lenStart = {
          x: position.x,
          y: position.y
        }

        this.isLensGrabbed = $event.target == this.lens;
      } else {
        this.startPositionX = position.x;
        this.startPositionY = position.y;
        if (!!this.lens) {
          this.render2.removeChild(this.el.nativeElement, this.lens);
        }
        this.lens = null;
      }

    }
  }
  dismissRectangle() {
    if (!!this.lens) {
      this.render2.removeChild(this.el.nativeElement, this.lens);
      this.render2.removeChild(this.el.nativeElement, this.dismissBtn);
      this.render2.removeChild(this.el.nativeElement, this.resizerDiv);

      this.lens = this.dismissBtn = this.resizerDiv = undefined;
      this.lensDrawComplete = false;
    }
  }

  @HostListener('mouseup', ['$event']) onMouseUp($event: any) {
    if ($event.which === 1) {
      this.isLeftButtonIsPressed = false;
      this.isResizerGrabbed = false;
      if (!!this.lens) {
        this.lensDrawComplete = true;
        if (this.newStartX != 0 || this.newStartY != 0) {
          this.startPositionX = this.newStartX;
          this.startPositionY = this.newStartY;
        }
      }
    }
  }


  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!event || !this.isLeftButtonIsPressed || !this.isEditActive) {
      return;
    }


    const position = this.getCursorPos(event)
    if (!this.lens) {
      this.createRectangle();
    }

    if (!!this.isResizerGrabbed) {
      this.endPositionX = position.x;
      this.endPositionY = position.y;
      this.setEndCoordinates(this.lens);
      this.setDismissBtnCorrdinates(this.startPositionX, this.endPositionY + 4);

      this.render2.setStyle(this.resizerDiv, 'left', this.endPositionX - (this.resizerWidth / 2) + 'px');
      this.render2.setStyle(this.resizerDiv, 'top', this.endPositionY - (this.resizerHeight / 2) + 'px');

    } else if (!!this.lensDrawComplete) {

      if (!this.isLensGrabbed) {
        console.log('lens not grabbed')
        return;
      }
      // if lens is drawn than 
      const x = this.startPositionX - (this.lenStart.x - position.x);
      const y = this.startPositionY - (this.lenStart.y - position.y);
      this.setStartCoordinates(this.lens, x, y);

      this.newStartX = x;
      this.newStartY = y;

      this.setDismissBtnCorrdinates(x, y + this.lensHeight + 4);

      //resizer
      this.render2.setStyle(this.resizerDiv, 'left', this.newStartX + this.lensWidth - (this.resizerWidth / 2) + 'px');
      this.render2.setStyle(this.resizerDiv, 'top', this.newStartY + this.lensHeight - (this.resizerHeight / 2) + 'px');

    } else {
      this.endPositionX = position.x;
      this.endPositionY = position.y;
      this.setEndCoordinates(this.lens);
      this.setDismissBtnCorrdinates(this.startPositionX, this.endPositionY + 4);

      this.render2.setStyle(this.resizerDiv, 'left', this.endPositionX - (this.resizerWidth / 2) + 'px');
      this.render2.setStyle(this.resizerDiv, 'top', this.endPositionY - (this.resizerHeight / 2) + 'px');
    }
  }
  private createRectangle() {
    const lens = this.render2.createElement('div');
    this.render2.addClass(lens, 'lens');
    this.render2.appendChild(this.el.nativeElement, lens);
    this.render2.setStyle(lens, 'position', 'absolute');
    this.render2.setStyle(lens, 'cursor', 'grab');
    this.render2.setStyle(lens, 'left', this.startPositionX + 'px');
    this.render2.setStyle(lens, 'top', this.startPositionY + 'px');
    this.lens = lens;

    // create x button
    const dismissButton = this.render2.createElement('div');
    const x = this.render2.createText('X');
    this.render2.appendChild(dismissButton, x);
    this.render2.appendChild(this.el.nativeElement, dismissButton);
    this.render2.setStyle(dismissButton, 'position', 'absolute');
    this.render2.setStyle(dismissButton, 'color', 'red');
    this.render2.setStyle(dismissButton, 'cursor', 'pointer');
    this.dismissBtn = dismissButton;


    const resizerDiv = this.render2.createElement('div');
    this.render2.setStyle(resizerDiv, 'position', 'absolute');
    this.render2.appendChild(this.el.nativeElement, resizerDiv);
    this.render2.setStyle(resizerDiv, 'border', '2px solid red');
    this.render2.setStyle(resizerDiv, 'width', this.resizerWidth + 'px');
    this.render2.setStyle(resizerDiv, 'height', this.resizerHeight + 'px');
    this.render2.setStyle(resizerDiv, 'cursor', 'nw-resize');
    this.resizerDiv = resizerDiv;
  }

  setEndCoordinates(lens: any) {

    let width = this.endPositionX - this.startPositionX,
      height = this.endPositionY - this.startPositionY;

    this.lensWidth = width;
    this.lensHeight = height;
    this.render2.setStyle(lens, 'width', width + 'px');
    this.render2.setStyle(lens, 'height', height + 'px');
  }
  setDismissBtnCorrdinates(x: number, y: number) {
    this.render2.setStyle(this.dismissBtn, 'left', x + 'px');
    this.render2.setStyle(this.dismissBtn, 'top', y + 'px');
  }

  setStartCoordinates(lens: any, x: number, y: number) {

    this.render2.setStyle(lens, 'left', x + 'px');
    this.render2.setStyle(lens, 'top', y + 'px');
  }

  private getCursorPos(e: MouseEvent) {
    var a, x = 0, y = 0;
    e = e || window.event;
    /*get the x and y positions of the image:*/
    a = this.el.nativeElement.getBoundingClientRect();

    /*calculate the cursor's x and y coordinates, relative to the image:*/
    x = e.pageX - a.left;
    y = e.pageY - a.top;
    /*consider any page scrolling:*/
    x = x - window.pageXOffset;
    y = y - window.pageYOffset;
    return { x: x, y: y, width: a.width, height: a.height };
  }

  private getCroppedImage(url: string, wFactor: number, hFactor: number, w: number, h: number, x: number, y: number, callback: any) {
    var canvas = document.createElement("canvas");
    var context: any = canvas.getContext('2d');
    var imageObj = new Image();

    const width = w * wFactor;
    const height = h * hFactor;

    canvas.width = width;
    canvas.height = height;

    imageObj.onload = function () {
      context.drawImage(imageObj, x * wFactor, y * hFactor, width, height, 0, 0, width, height);
      callback(canvas.toDataURL('image/jpeg', .92));
    };

    imageObj.src = url;
  }

  public doCropping() {
    console.log('croppedImg');
    if (!this.lens) {
      console.log('press mouse left button and drag over image');
      return;
    }
    return new Promise((r => {
      const wFactor = this.imgNaturalWidth / this.imgWidth; // imgWidth* img el width
      const hFactor = this.imgNaturalHeight / this.imgHeight; // imgHeight* img el height
      this.getCroppedImage(this.assetUrl, wFactor, hFactor, this.lensWidth, this.lensHeight, this.startPositionX, this.startPositionY, (croppedImg: any) => {
        // console.log(croppedImg);
        r({ img: croppedImg, width: this.lensWidth * wFactor, height: this.lensHeight * hFactor, x: this.startPositionX * wFactor, y: this.startPositionY * hFactor });
      });
    }));
  }

  public markThis(image: { img: string; width: number; height: number; x: number; y: number; }) {
    console.log(image);
    const wFactor = this.imgNaturalWidth / this.imgWidth; // imgWidth* img el width
    const hFactor = this.imgNaturalHeight / this.imgHeight; // imgHeight* img el height
    this.startPositionX = image.x / wFactor;
    this.startPositionY = image.y / hFactor;

    this.endPositionX = this.startPositionX + (image.width / wFactor);
    this.endPositionY = this.startPositionY + (image.height / hFactor);

    //create lens
    if (!this.lens) {
      this.createRectangle();
    }

    this.render2.setStyle(this.lens, 'left', this.startPositionX + 'px');
    this.render2.setStyle(this.lens, 'top', this.startPositionY + 'px');
    this.setEndCoordinates(this.lens);

    this.setDismissBtnCorrdinates(this.startPositionX, this.endPositionY + 4);

    this.render2.setStyle(this.resizerDiv, 'left', this.endPositionX - (this.resizerWidth / 2) + 'px');
    this.render2.setStyle(this.resizerDiv, 'top', this.endPositionY - (this.resizerHeight / 2) + 'px');
  }


  showAll(imageList: { img: string; width: number; height: number; x: number; y: number; }[]) {
    this.disableEdit();
    this.dismissRectangle();
    this.removeAllMarkers();

    for (let image of imageList) {

      const wFactor = this.imgNaturalWidth / this.imgWidth; // imgWidth* img el width
      const hFactor = this.imgNaturalHeight / this.imgHeight; // imgHeight* img el height

      const lens = this.render2.createElement('div');
      this.render2.addClass(lens, 'lens');
      this.render2.setStyle(lens, 'position', 'absolute');
      this.render2.setStyle(lens, 'cursor', 'grab');
      this.render2.setStyle(lens, 'left', (image.x / wFactor) + 'px');
      this.render2.setStyle(lens, 'top', (image.y / hFactor) + 'px');
      this.render2.setStyle(lens, 'width', (image.width / wFactor) + 'px');
      this.render2.setStyle(lens, 'height', (image.height / hFactor) + 'px');
      this.render2.appendChild(this.el.nativeElement, lens);
      this.markedLens.push(lens);

    }
  }
  removeAllMarkers() {
    if (this.markedLens.length > 0) {
      for (let l of this.markedLens) {
        this.render2.removeChild(this.el.nativeElement, l);
      }
      this.markedLens = [];
    }
  }


}


