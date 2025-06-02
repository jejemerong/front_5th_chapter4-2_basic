# 바닐라 자바스크립트 프로젝트 성능 개선 과제

url: "https://d1xp4u2x1t7k5z.cloudfront.net/"

# 성능 보고서

최적화 할 수 있는 것들

- [ ] js, css 로딩 최적화
- [ ] 이벤트 관리
- [ ] 애니메이션

### 이미지 리소스 최적화

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

  | 전/후 | 메트릭 | 설명 | 측정값 | 상태 | 증감율 |
  |-----|--------|------|--------|------|----|
  | 전 | LCP | Largest Contentful Paint | 14.78s | 🔴 | - |
  | 후 | LCP | Largest Contentful Paint | 9.61s | 🔴 | 33.96% ⬇️ |

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

### 개선 이유

### 개선 방법

### 개선 후 향상된 지표

### 기타
