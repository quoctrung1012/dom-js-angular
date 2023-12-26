import {DynamicComponent} from "./dynamic.component";

@Component({
  selector: 'app-dynamic',
  template: `
    <div #container>
      <span>ahjdkj</span>
    </div>`,
})
export class ViewComponent {
  @ViewChild('container', {static:false}) container: ElementRef;
  constructor(private vcr: ViewContainerRef,) {

  }

  createAngularComponent<C>(component: Type<C>, targetElement?: Element, data?: any, createCompOptions?: CreateComponentOption) {
    const componentRef = this.vcr.createComponent(component, createCompOptions);

    if (componentRef?.instance && data) {
      Object.assign(componentRef.instance as any, data);
      componentRef.changeDetectorRef.detectChanges();
    }

    let domElem: HTMLElement | null = null;
    const viewRef = (componentRef.hostView as EmbeddedViewRef<any>);

    if (viewRef && Array.isArray(viewRef.rootNodes) && viewRef.rootNodes[0]) {
      domElem = viewRef.rootNodes[0] as HTMLElement;

      if (targetElement && domElem) {
        targetElement.innerHTML = domElem.innerHTML;
      }
    }

    return { componentRef, domElement: domElem as HTMLElement };
  }
  createAngularComponentAppendToDom<C>(component: Type<C>, targetElement?: Element, data?: any, createCompOptions?: CreateComponentOption) {
    const componentOutput = this.createAngularComponent(component, targetElement, data, createCompOptions);

    if (targetElement?.replaceChildren) {
      targetElement.replaceChildren(componentOutput.domElement);
    } else {
      document.body.appendChild(componentOutput.domElement);
    }

    return componentOutput;
  }
  add() {
    const componentOutput = this.createAngularComponentAppendToDom(DynamicComponent,this.container.nativeElement)
  }
}

interface CreateComponentOption {
  index?: number;
  injector?: Injector;
  ngModuleRef?: NgModuleRef<unknown>;
  environmentInjector?: EnvironmentInjector | NgModuleRef<unknown>;
  projectableNodes?: Node[][];
}