# 바닐라 자바스크립트 프로젝트 성능 개선 과제

url: "https://d1xp4u2x1t7k5z.cloudfront.net/"

# 성능 보고서

### 이미지 리소스 최적화 - webp 사용

- **개선 이유**

  현재 프로젝트에서 사용 중인 JPG 파일은 손실 압축 방식으로 저장되며, 압축률이 낮을 경우 파일 크기가 크고, 압축률을 높이면 화질 저하가 발생한다는 특징이 있다.
  WebP는 동일한 품질을 유지하면서도 더 효율적인 압축이 가능하고 JPG 대비 약 25~34% 정도 파일 크기를 줄일 수 있다.
  그렇기 때문에 사용자가 페이지를 열 때 필요한 리소스 양 자체가 줄어들어 페이지 로딩 속도도 줄어든다.
  이로 인해 FCP와 LCP 지표가 개선되는 효과를 볼 수 있다.

- **개선 방법**

  index.html에서 이미지를 사용하고 있는 부분에 다음과 같이 수정한다. picture, source 태그를 추가하여 브라우저가 webp를 지원하면 WebP 이미지를 로딩하고, 지원하지 않으면 JPG 이미지를 로딩하도록 한다.
  이때, img 태그는 fallback(대체용) 역할을 하며 남겨둔다.

  ```html
  <picture>
    <source srcset="images/vr1.webp" type="image/webp" />
    <img src="images/vr1.jpg" alt="product: Penom Case" />
  </picture>
  ```

- **개선 후 향상된 지표**

  images 폴더 내에 jpg 확장자의 이미지를 webp 확장자의 이미지로 변경했을 때,
  LCP 지표가 14.78s에서 9.76s로 감소하며 33.96% 개선되었다.

  | 전/후 | 메트릭 | 설명                     | 측정값    | 상태 | 증감율    |
  | ----- | ------ | ------------------------ | --------- | ---- | --------- |
  | 전    | LCP    | Largest Contentful Paint | 14.78s    | 🔴   | -         |
  | 후    | LCP    | Largest Contentful Paint | **9.61s** | 🔴   | 33.96% ⬇️ |

### 이미지 리소스 최적화 - lazy loading 적용

- **개선 이유**
  img 태그는 DOM에 삽입되는 즉시 이미지 다운로드를 시작하는데 이때, 이 작업은 렌더링 차단 요소가 된다.
  초기 렌더링 시점에 불필요한 네트워크 요청과 이미지 디코딩 작업을 줄이기 위해서는 이미지 로딩을 미루도록 loading="lazy"를 설정한다.
  그러면 사용자가 화면 스크롤을 내리면서 이미지가 보일 때 네트워크 요청을 하게 되고 페이지 로딩 속도를 개선시킬 수 있다.
- **개선 방법**
  product.js 내에서 img.loading = "lazy"; 와 같이 lazy loading 속성을 설정한다.

- **개선 후 향상된 지표**

  | 전/후 | 메트릭 | 설명                     | 측정값    | 상태 | 증감율 |
  | ----- | ------ | ------------------------ | --------- | ---- | ------ |
  | 전    | LCP    | Largest Contentful Paint | 9.61s     | 🔴   | -      |
  | 후    | LCP    | Largest Contentful Paint | **4.13s** | 🔴   | % ⬇️   |

  하지만 원래 Good의 범위에 있던 CLS 지표가 0.011 에서 0.514 로 오히려 성능이 나빠진 것을 확인할 수 있었다.
  index.html의 link 태그에서 loading="lazy"으로 설정했던 속성을 다시 제거했더니 지표가 향상되었다. 왜지?

### 이미지 최적화 - 이미지 크기 조정

- **개선 이유**
  페이지에서 사용자 화면에 렌더링되는 버전보다 더 큰 이미지를 전송하면 바이트가 낭비되고 페이지 로드 시간이 느려진다.

### 폰트 최적화

- **개선 이유**

  기본적으로 `<link rel="stylesheet">` 는 폰트 파일이 로딩될 때까지 HTML 렌더링을 중단시킨다.
  이때, `rel="preload"` + `onload`를 사용하면 비차단 방식으로 폰트를 불러올 수 있기 때문에 렌더링 차단되는 시간을 줄일 수 있다. 그리고 직접 개선하지는 않았지만 Google Fonts URL 자체에 `display=swap` 파라미터가 포함되어 있어 웹폰트가 로딩되기 전까지는 시스템 폰트를 먼저 보여주기 때문에 사용자 경험이 개선된다.

  그리고 noscript 태그를 추가하여 사용자의 브라우저 설정으로 자바스크립트가 꺼져 있는 경우에도 대체 폰트 로딩을 지원하기 때문에 다음과 같이 작성할 수 있다.

- **개선 방법**

  `rel="stylesheet"`을 `rel="preload"`로 수정하고 대체적으로 로딩할 경우를 noscript 태그를 이용하여 설정한다.

  ```html
  <link
    rel="preload"
    as="style"
    href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;600;700&display=swap"
    onload="this.rel='stylesheet'"
  />
  <noscript>
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;600;700&display=swap"
    />
  </noscript>
  ```

- **개선 후 향상된 지표**

### 불필요한 연산 제거 및 비동기 처리

- **개선 이유**
  과제에서는 무거운 연산과 같은 효과를 내기 위해 반복문이 아래와 같이 작성되어 있는데
  일단 `Math.sqrt(i) \* Math.sqrt(i)`는 결국 i와 동일하기 때문에 불필요한 연산으로 제거하는 것이 필요하다.

  그리고 이 반복문이 실행될 때는 브라우저 메인 스레드를 블로킹하기 때문에 비동기로 처리하는 것도 최적화 방법이 될 수 있다.

  ```js
  for (let i = 0; i < 10000000; i++) {
    const temp = Math.sqrt(i) * Math.sqrt(i);
  }
  ```

- **개선 방법**
  먼저 반복문 안의 불필요한 연산을 제거해 `const temp = i;`로 변경한다.
  그리고 해당 반복문이 실행되는 product.js가 아닌 worker.js로 파일을 분리하고 product.js 파일에서는 웹 워커를 생성하여 백그라운드에서 작업을 수행하고 완료 메세지를 수신하도록 다음과 같이 작성한다.

  ```js
  const worker = new Worker("./js/worker.js");
  worker.postMessage("start");
  ```

  worker.js 파일에서는 작업이 완료되면 결과를 주 스레드로 전달하도록 워커에 메세지를 전송한다.

  ```js
  self.onmessage = function (event) {
    if (event.data === "start") {
      for (let i = 0; i < 10000000; i++) {
        const temp = i;
      }
      self.postMessage("done");
    }
  };
  ```

  이때, `self`는 웹 워커의 컨텍스트 내에서 사용할 수 있는 전역 객체로 워커 스레드에서 현재 워커의 전역 범위를 참조하며, 주 스레드의 `window` 객체와 유사한 역할을 한다.

- **개선 후 향상된 지표**

  | 전/후 | 메트릭 | 설명                     | 측정값    | 상태 | 증감율 |
  | ----- | ------ | ------------------------ | --------- | ---- | ------ |
  | 전    | LCP    | Largest Contentful Paint | 4.13s     | 🔴   | -      |
  | 후    | LCP    | Largest Contentful Paint | **3.20s** | 🟠   | % ⬇️   |

- [ ] 렌더링 차단 리소스 제거하기
      어떤 것이 렌더링 차단 리소스인가?

### 스크립트 로딩 및 실행 방식 최적화

- **개선 이유**
  스크립트가 비동기적으로 로드되면 다른 리소스와의 충돌을 줄일 수 있기 때문에 LCP 지표를 개선할 수 있다.
  DOM에 의존하지 않는 스크립트에 대해서는 async를 붙여서 HTML 문서의 파싱과 동시에 비동기적으로 로드되도록 실행한다.

- **개선 방법**
  다음과 같이 DOM 요소에 직접적으로 의존하지 않는 GTM 스크립트와 같은 경우에는 비동기적으로 로드하도록 async를 붙여 실행한다.
  ```js
    <script async>
      (function (w, d, s, l, i) {
        w[l] = w[l] || [];
        w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
        var f = d.getElementsByTagName(s)[0],
          j = d.createElement(s),
          dl = l != "dataLayer" ? "&l=" + l : "";
        j.async = true;
        j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
        f.parentNode.insertBefore(j, f);
      })(window, document, "script", "dataLayer", "GTM-PKK35GL5");
    </script>
  ```

  그리고 다음과 같이 사용자의 쿠키 사용 동의를 요청하는 배너 스크립트는 DOM에 의존성을 가지기 때문에 defer 속성을 추가해서 HTML 문서의 파싱이 완료된 후에 스크립트가 실행되도록 한다.
  ```js
      <script
        defer
        type="text/javascript"
        src="//www.freeprivacypolicy.com/public/cookie-consent/4.1.0/cookie-consent.js"
        charset="UTF-8"
      ></script>
      <script defer type="text/javascript" charset="UTF-8">
        cookieconsent.run({
          notice_banner_type: "simple",
          consent_type: "express",
          palette: "light",
          language: "en",
          page_load_consent_levels: ["strictly-necessary"],
          notice_banner_reject_button_hide: false,
          preferences_center_close_button_hide: false,
          page_refresh_confirmation_buttons: false,
          website_name: "Performance Course",
        });
      </script>
  ```
