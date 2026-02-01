class HrTxt extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    // スタイルをカプセル化
    const style = document.createElement('style');
    style.textContent = `
      :host { display: block; overflow: hidden; width: 100%; }
      .container { 
        white-space: nowrap; 
        text-align: center; 
        word-break: keep-all;
      }
    `;
    this.container = document.createElement('div');
    this.container.className = 'container';
    this.shadowRoot.append(style, this.container);
  }

  connectedCallback() {
    // 初回描画と監視開始
    this.render();
    this.observer = new ResizeObserver(() => this.render());
    this.observer.observe(this);
  }

  disconnectedCallback() {
    if (this.observer) this.observer.disconnect();
  }

  render() {
    const pattern = this.textContent.trim();
    if (!pattern) return;

    const offsetCount = parseInt(this.getAttribute('offset') || '0', 10);
    const space = '　'; // 全角スペース

    // 1. 測定用の要素を作成
    const measurer = document.createElement('span');
    measurer.style.visibility = 'hidden';
    measurer.style.position = 'absolute';
    measurer.style.whiteSpace = 'nowrap';
    this.shadowRoot.appendChild(measurer);

    // 2. パターン単体と全角スペース単体の幅を測定
    measurer.textContent = pattern;
    const patternWidth = measurer.getBoundingClientRect().width;
    
    measurer.textContent = space;
    const spaceWidth = measurer.getBoundingClientRect().width;
    
    // 3. 計算
    const hostWidth = this.offsetWidth;
    const totalOffsetWidth = spaceWidth * offsetCount * 2; // 左右分
    const availableWidth = hostWidth - totalOffsetWidth;
    
    // 見切れを防ぐため Math.floor で最大個数を算出
    const count = Math.floor(availableWidth / patternWidth);
    
    // 4. 反映
    if (count > 0) {
      const sideSpaces = space.repeat(offsetCount);
      this.container.textContent = `${sideSpaces}${pattern.repeat(count)}${sideSpaces}`;
    } else {
      this.container.textContent = ''; // 入らない場合は何も表示しない
    }

    // 5. 測定用要素の削除
    this.shadowRoot.removeChild(measurer);
  }
}

customElements.define('hr-txt', HrTxt);
