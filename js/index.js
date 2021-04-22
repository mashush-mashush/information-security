/*

  @prepros-append Link.js
  @prepros-append Header.js
  @prepros-append Crypt.js
  @prepros-append Code.js
  @prepros-append Docs.js
  @prepros-append script.js

*/

// links

class Link {
  constructor(selector) {
    this.list = document.querySelectorAll(selector);
    this.setup();
  }

  setup() {
    this.list.forEach( link => {
      link.addEventListener('click', this.scrollToSection);
    });
  }

  scrollToSection(event) {
    event.preventDefault();

    const menu = document.querySelector('header');
    const href = event.currentTarget.getAttribute('href');
    const elem = document.querySelector(href);
    const dist = elem.getBoundingClientRect().top;

    window.scrollBy({
      behavior: 'smooth',
      top: dist - menu.offsetHeight
    });
  }
}

// header

class Header {
  constructor(selector) {
    this.$el  = document.querySelector(selector);
    this.menu = this.$el.querySelector('.menu');
    this.burg = this.$el.querySelector('.menu__burger');
    this.list = this.$el.querySelectorAll('.menu__link')
    this.setup();
    this.headerHandler();
  }

  setup() {
    window.addEventListener('scroll', this.headerHandler.bind(this));

    this.burg.addEventListener('click', () => {
      this.toggle('menu');
      this.toggle('burg');
    });

    this.list.forEach( link => {
      link.addEventListener('click', (event) => {
        this.toggle('link', event.target);

        if (this.menuIsOpen()) {
          this.toggle('menu');
          this.toggle('burg');
        }
      });
    })
  }

  menuIsOpen() {
    return this.menu.classList.contains('menu--show');
  }

  toggle(name, element) {
    switch(name) {
      case 'burg': this.burg.classList.toggle('menu__burger--active'); break;
      case 'menu': this.menu.classList.toggle('menu--show'); break;
      case 'link': 
        this.list.forEach( link => {
          if (link === element) {
            link.classList.add('menu__link--active');
            return;
          }
          link.classList.remove('menu__link--active');
        });
        break;
    }
  }

  headerHandler() {
    if (window.scrollY > 50) {
      this.$el.classList.add('header--scroll');
      return;
    }
    this.$el.classList.remove('header--scroll');
  }
}

// crypt

class Crypt {
  constructor(selector) {
    this.$el         = document.querySelector(selector);
    this.methodCrypt = 'min';
    this.inputSource = this.$el.querySelector('[data-input-source]');
    this.inputResult = this.$el.querySelector('[data-input-result]');
    this.buttonSend  = this.$el.querySelector('[data-button-submit]');
    this.buttonsMethod = this.$el.querySelectorAll('[data-button-method]');
    this.setup();
    this.initSlider();
  }


  setup() {
    this.buttonsMethod.forEach( button => {
      button.addEventListener('click', this.setMethodCrypt.bind(this));
    });
    this.buttonSend.addEventListener('click', this.dataPreparation.bind(this));
  }


  initSlider() {
    const buttonSlider = new Swiper('[data-buttons-slider]', {
      breakpoints: {
        0: {
          allowTouchMove: true,
          slidesPerView: 'auto',
          spaceBetween: 20,
          freeMode: true
        },
        540: {
          allowTouchMove: false,
          slidesPerView: 'auto',
          spaceBetween: 0,
          freeMode: false
        }
      }
    });
  }


  setMethodCrypt(event) {
    this.buttonsMethod.forEach( button => {
      if (button === event.target) {
        button.setAttribute('data-method-select', null);
        this.methodCrypt = button.getAttribute('data-method-value');
        return;
      }
      button.removeAttribute('data-method-select');
    });
  }


  validate() {
    return this.inputSource.value.trim().length > 0;
  }


  getResult({message, method, typeCrypt}) {
    switch(method) {
      case 'min': return this.getMinCrypt(message);
      case 'mid': return this.getMidCrypt(message);
      case 'max': return this.getMaxCrypt(message, typeCrypt);
    }
  }


  dataPreparation({currentTarget: button}) {
    if (this.validate()) {
      this.inputResult.value = this.getResult({
        message: this.inputSource.value.trim(), 
        method: this.methodCrypt,
        typeCrypt: button.getAttribute('data-button-crypt')
      });
      return this.showStatus('nice');
    }
    return this.showStatus('fail');
  }


  getMinCrypt(message) {
    return message
      .split(' ')
      .map( (word) => {
        return word
          .split('')
          .reverse()
          .join('');
      })
      .reverse()
      .join(' ');
  }


  getMidCrypt(message) {
    return message
      .split(' ')
      .map( (word) => {
        const list = word.split('');

        for (let curr = 0, next = 1; next < list.length; curr++, next++) {
          if (next % 2 === 1) {
            const currEl = list[curr];
            const nextEl = list[next];

            list[curr] = nextEl;
            list[next] = currEl;
          }
        }

        return list.join('');
      })
      .reverse()
      .join(' ');
  }


  getMaxCrypt(message, typeCrypt) {
    // исходный данные
    const messageSource = message.split('');
    const messageLength = message.length;
    const sourceMatrix  = [];
    const resultMatrix  = [];

    let columnLength;
    let seriesLength;

    // определение пропорций матрицы
    if (typeCrypt === 'decrypt') {
      seriesLength = 4;
      columnLength = Math.ceil(messageLength / seriesLength);
    }
    if (typeCrypt === 'encrypt') {
      columnLength = 4;
      seriesLength = Math.ceil(messageLength / columnLength);
    }
    
    // заполнение матриц промежуточного и конечного результатов
    for (let i = 0; i < seriesLength; i++) sourceMatrix.push(new Array(columnLength).fill(0));
    for (let i = 0; i < columnLength; i++) resultMatrix.push(new Array(seriesLength).fill(0));

    // заполнение матрицы данными из сообщения
    messageSource.forEach( (content, index) => {
      const numberRow = Math.floor(index / columnLength);
      const numberCol = index % columnLength;
      sourceMatrix[numberRow][numberCol] = content;
    });

    // заполнение результата "перевернутой" матрицей
    sourceMatrix.forEach( (series, seriesIndex) => {
      series.forEach( (content, columnIndex) => {
        resultMatrix[columnIndex][seriesIndex] = content;
      })
    });

    // вернуть результат
    return resultMatrix
      .map( (series) => {
        return series
          .filter( (content) => content !== 0)
          .join('')
      })
      .join('');
  }


  showStatus(status) {
    this.inputSource.setAttribute(`data-input-status`, status);
  }
}

// code

class Code {
  constructor(selector) {
    this.$el    = document.querySelector(selector);
    this.codeAr = this.$el.querySelector('[data-codearea]');
    this.button = this.$el.querySelector('[data-button-copy]');
    this.setup();
  }

  setup() {
    this.button.addEventListener('click', this.copyText.bind(this));
  }


  getCode(method) {
    switch(method) {
      case 'min':
        return `getMinCrypt(message) {
          return message
            .split(' ')
            .map( (word) => {
              return word
                .split('')
                .reverse()
                .join('');
            })
            .reverse()
            .join(' ');
        }`;
      case 'mid':
        return `getMidCrypt(message) {
          return message
            .split(' ')
            .map( (word) => {
              const list = word.split('');
      
              for (let curr = 0, next = 1; next < list.length; curr++, next++) {
                if (next % 2 === 1) {
                  const currEl = list[curr];
                  const nextEl = list[next];
      
                  list[curr] = nextEl;
                  list[next] = currEl;
                }
              }
      
              return list.join('');
            })
            .reverse()
            .join(' ');
        }`;
      case 'max':
        return `getMaxCrypt(message, typeCrypt) {
          const messageSource = message.split('');
          const messageLength = message.length;
          const sourceMatrix  = [];
          const resultMatrix  = [];
      
          let columnLength;
          let seriesLength;
      
          if (typeCrypt === 'decrypt') {
            seriesLength = 4;
            columnLength = Math.ceil(messageLength / seriesLength);
          }
          if (typeCrypt === 'encrypt') {
            columnLength = 4;
            seriesLength = Math.ceil(messageLength / columnLength);
          }
          
          for (let i = 0; i < seriesLength; i++) sourceMatrix.push(new Array(columnLength).fill(0));
          for (let i = 0; i < columnLength; i++) resultMatrix.push(new Array(seriesLength).fill(0));
      
          messageSource.forEach( (content, index) => {
            const numberRow = Math.floor(index / columnLength);
            const numberCol = index % columnLength;
            sourceMatrix[numberRow][numberCol] = content;
          });
      
          sourceMatrix.forEach( (series, seriesIndex) => {
            series.forEach( (content, columnIndex) => {
              resultMatrix[columnIndex][seriesIndex] = content;
            })
          });
      
          return resultMatrix
            .map( (series) => {
              return series
                .filter( (content) => content !== 0)
                .join('')
            })
            .join('');
        }`;
    }
  }



  changeButtonText(text) {
    this.button.textContent = text;
    setTimeout(() => {
      this.button.textContent = 'Скопировать код';
    }, 2000);
  }



  copyText() {
    const codeMethod = this.button.getAttribute('data-button-copy-method');
    const codeResult = this.getCode(codeMethod);
    navigator.clipboard.writeText(codeResult)
    .then(() => {
      this.changeButtonText('Код скопирован!');
    });
  }
}
class Docs {
  constructor(selector) {
    this.$el    = document.querySelector(selector);
    this.button = this.$el.querySelector('[data-docs-button]');
    this.setup();
  }

  setup() {
    this.button.addEventListener('click', () => {
      this.toggleButton();
      this.toggleItem();
    })
  }

  toggleButton() {
    this.button.classList.toggle('docs-item__button--active');
  }

  toggleItem() {
    this.$el.classList.toggle('docs-item--open');
  }
}

// init classes

const links = new Link('[data-to-section]');
const header = new Header('#header');
const encrypt = new Crypt('#crypt-encrypt');
const decrypt = new Crypt('#crypt-decrypt');
const codeMin = new Code('#code-min');
const codeMid = new Code('#code-mid');
const codeMax = new Code('#code-max');
const docs1   = new Docs('#docs-1');
const docs2   = new Docs('#docs-2');
const docs3   = new Docs('#docs-3');
const docs4   = new Docs('#docs-4');
const wow     = new WOW().init();
