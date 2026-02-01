class HrTxt extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = `
      :host { display: block; overflow: hidden; width: 100%; }
      .container { white-space: nowrap; width: 100%; }
    `;
    this.container = document.createElement('div');
    this.container.className = 'container';
    this.shadowRoot.append(style, this.container);
  }

  static get observedAttributes() {
    return ['offset', 'maxlen', 'align'];
  }

  connectedCallback() {
    this.render();
    this.observer = new ResizeObserver(() => this.render());
    this.observer.observe(this);
  }

  attributeChangedCallback() { this.render(); }

  render() {
    const pattern = this.textContent.trim();
    if (!pattern) return;

    // 属性の取得
    const offsetCount = parseInt(this.getAttribute('offset') || '0', 10);
    const maxLen = parseInt(this.getAttribute('maxlen') || 'Infinity', 10);
    const align = this.getAttribute('align') || 'center';
    const spaceChar = '　';

    // 1. 測定
    const measurer = document.createElement('span');
    measurer.style.cssText = 'visibility:hidden; position:absolute; white-space:nowrap;';
    this.shadowRoot.appendChild(measurer);

    measurer.textContent = pattern;
    const patternWidth = measurer.getBoundingClientRect().width;
    measurer.textContent = spaceChar;
    const spaceWidth = measurer.getBoundingClientRect().width;
    this.shadowRoot.removeChild(measurer);

    const hostWidth = this.offsetWidth;

    // 2. ロジック：表示個数の算出
    // a) まずオフセットを含めた状態で入る数
    let count = Math.floor((hostWidth - (spaceWidth * offsetCount * 2)) / patternWidth);
    let currentOffset = offsetCount;

    // b) 1つも入らない場合、オフセットを削ってでも1つ表示する
    if (count <= 0) {
      count = 1;
      currentOffset = 0; // オフセットを破棄して表示優先
    }

    // c) maxlen制限
    if (count > maxLen) {
      count = maxLen;
    }

    // 3. レンダリング
    const sideSpaces = spaceChar.repeat(currentOffset);
    this.container.textContent = `${sideSpaces}${pattern.repeat(count)}${sideSpaces}`;
    
    // 4. 配置（align）の反映
    const alignMap = { left: 'left', right: 'right', center: 'center' };
    this.container.style.textAlign = alignMap[align] || 'center';
  }
}

customElements.define('hr-txt', HrTxt);

