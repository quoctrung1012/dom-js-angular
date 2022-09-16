export declare abstract class Renderer2 {
  abstract createElement(name: string, namespace?: string | null): any;
  abstract appendChild(parent: any, newChild: any): void;
}

export declare interface OnInit {
  ngOnInit(): void;
}

export declare class ElementRef<T = any> {
  nativeElement: T;
}

export class LoadScriptComponent implements OnInit {
  constructor(private renderer: Renderer2,
              private readonly elementRef: ElementRef,) {
  }

  initFile(url: string) {
    let domainJs = window.origin + '/js/';
    // let domainJs = 'https://dfile-dev.inetcloud.vn/js/';
    const script = this.renderer.createElement('script');
    script.src = domainJs + url;
    script.onload = () => {
      console.log('script loaded ' + url);
    };
    this.renderer.appendChild(this.elementRef.nativeElement, script);
    return script
  }

  ngOnInit(): void {
    this.initFile('common/inet/lib/inet-utilities.min.js')
    this.initFile('common/inet/lib/form-builder-plugin.min.js')
  }
}
