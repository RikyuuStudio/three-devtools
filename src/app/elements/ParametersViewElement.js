import { html } from '../../../web_modules/lit-element.js'
import BaseElement from './BaseElement.js';
import ObjectTypes from '../data/objects.js';
import MaterialTypes from '../data/materials.js';

function propsToElements(object, elements, props) {
  for (let prop of props) {
    const { name, type, prop: propName, default: def } = prop;
    if (type === 'group') {
      const subProps = [];
      propsToElements(object, subProps, [...prop.props]);
      elements.push(html`<accordion-view>
        <div slot="content">${name}</div>
        ${subProps}
      </accordion-view>`);
      continue;
    } else {
      const value = (propName in object) ? object[propName] : def;
      elements.push(html`
        <key-value uuid=${object.uuid}
          key-name="${name}"
          .value="${value}"
          type="${type}"
          property="${propName}">
        </key-value>`);
    }
  }
}

export default class ParametersViewElement extends BaseElement {
  static get typeHint() { return ''; }

  static get properties() {
    return {
      ...BaseElement.properties,
    }
  }

  render() {
    const object = this.getEntity();

    if (!object) {
      return html`<div>no object selected</div>`;
    }

    let definition = ObjectTypes[object.type] ||
                       MaterialTypes[object.type];

    // It's possible the types are unknown e.g. modified
    // by a user. Use the next best guess.
    if (!definition) {
      switch (object.typeHint) {
        case 'scene':
          definition = ObjectTypes.Scene; break;
        case 'object':
          definition = ObjectTypes.Object3D; break;
        case 'material':
          definition = MaterialTypes.Material; break;
        default:
          throw new Error(`could not find definition for ${object.type}`);
      }
    }

    const objectType = '';
    const objectName = object.name || object.type;
    const elements = [];
    propsToElements(object, elements, [...definition.props]);

    return html`
<style>
  :host {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
  }

  .properties {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .mesh { display: none; }
  [object-hint="mesh"] .mesh { display: flex; }
</style>
<title-bar title="${objectName}">
  <devtools-icon-button icon="refresh" @click="${this.refresh}">
</title-bar>
<div class="properties" object-hint="${objectType}">
  <key-value uuid=${this.uuid} key-name="Type" .value="${object.type}" type="string" property="type"></key-value>
  <key-value uuid=${this.uuid} key-name="UUID" .value="${object.uuid}" type="string" property="uuid"></key-value>
  <key-value uuid=${this.uuid} key-name="Name" .value="${object.name}" type="string" property="name"></key-value>
  ${elements} 
</div>
`;
  }
}
