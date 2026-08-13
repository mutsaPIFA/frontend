# MCM MUSE Figma 개발 전달 컨벤션 v1.0

> **목적**  
> 디자이너가 만든 Figma를 개발자가 직접 구현하거나, Figma MCP + Codex를 이용해 코드로 변환할 때  
> **디자인 구조가 코드 구조로 자연스럽게 이어지도록 만드는 최소 작업 규칙**입니다.
>
> 초보 디자이너도 바로 적용할 수 있도록 복잡한 규칙은 줄이고, 꼭 필요한 기준만 정리했습니다.

---

## 1. 가장 먼저 기억할 5가지

디자인할 때 아래 5가지만 반드시 지켜주세요.

1. **화면 하나 = Frame 하나**
2. **화면 안의 큰 영역도 Frame으로 묶기**
3. **가로/세로로 나열되는 요소에는 Auto Layout 적용**
4. **두 번 이상 반복되는 UI는 Component로 만들기**
5. **`Frame 23`, `Rectangle 7` 대신 의미가 드러나는 이름 붙이기**

### 핵심 원칙

> **예쁘게 보이는 것뿐 아니라, 화면이 어떤 UI 덩어리들로 구성되어 있는지가 레이어 구조에서도 보여야 합니다.**

---

# 2. Figma 파일 전체 구조

화면을 한 Canvas에 모두 섞어 두기보다 **Page를 역할별로 나눕니다.**

```text
MCM MUSE

├─ 00_Foundations
├─ 01_Components
│
├─ 10_Home_Scan
├─ 20_Closet
├─ 30_Styling
├─ 40_Profile
└─ 50_Archive
```

## 2-1. `00_Foundations`

공통 디자인 규칙을 모아두는 Page입니다.

```text
00_Foundations

├─ Colors
├─ Typography
├─ Spacing
└─ Radius
```

예시:

- 브랜드 메인 컬러
- 배경색
- 텍스트 컬러
- 버튼 컬러
- 제목/본문 글자 스타일
- 기본 여백
- 카드 Radius

---

## 2-2. `01_Components`

여러 화면에서 반복되는 UI를 모아두는 Page입니다.

```text
01_Components

├─ Button
├─ Input
├─ Badge
├─ Header
├─ BottomNavigation
├─ ProductCard
├─ ClosetCard
└─ MoodCard
```

---

## 2-3. 화면 Page

예시:

```text
10_Home_Scan

├─ 00_Splash
├─ 01_Onboarding
├─ 02_ClosetScan
├─ 03_ClosetScanResult
├─ 04_StyleDNA
├─ 05_MCMRecommendation
├─ 06_ProductDetail
├─ 07_ARPreview
└─ 08_Checkout
```

---

# 3. 화면 하나를 만드는 기본 구조

## ❌ 피해야 하는 구조

```text
05_MCMRecommendation

├─ Rectangle 28
├─ Text 31
├─ Image 4
├─ Text 33
├─ Rectangle 52
├─ Image 5
├─ Text 38
├─ Icon 9
├─ Icon 10
└─ Icon 11
```

사람 눈에는 상품 카드와 하단 네비게이션으로 보이지만,  
Figma 레이어 구조만 보면 어떤 요소끼리 한 묶음인지 알기 어렵습니다.

---

## ✅ 권장 구조

```text
05_MCMRecommendation

├─ Header
│
├─ Content
│   │
│   ├─ Intro
│   │   ├─ Title
│   │   └─ Description
│   │
│   ├─ RecommendationList
│   │   ├─ ProductCard
│   │   ├─ ProductCard
│   │   └─ ProductCard
│   │
│   └─ CTA
│
└─ BottomNavigation
```

### 묶는 기준

> **화면에서 하나의 의미 있는 덩어리처럼 보이면 Frame으로 묶습니다.**

예:

- Header
- ProductCard
- ProductList
- SearchBar
- BottomNavigation
- LoginForm
- RecommendationSection

---

# 4. Group보다 Frame을 우선 사용

## Group을 써도 되는 경우

장식용 그림처럼 **UI 구조가 아닌 시각 요소 묶음**은 Group이어도 됩니다.

```text
MascotIllustration

├─ Shape
├─ Shape
├─ Shape
└─ Shape
```

---

## Frame을 써야 하는 경우

실제 UI 영역은 Frame을 사용합니다.

```text
Header
ProductCard
SearchBar
ProductList
BottomNavigation
Form
Section
```

### 쉽게 기억하기

- **그림 묶음 → Group 가능**
- **UI 구조 → Frame**

---

# 5. Auto Layout 사용 규칙

> **가로나 세로로 나란히 놓이는 UI에는 Auto Layout을 적용합니다.**

단축키:

```text
Shift + A
```

---

## 5-1. 세로 배치

예:

```text
상품 이미지
↓
상품명
↓
가격
↓
추천 이유
```

구조:

```text
ProductCard [Vertical Auto Layout]

├─ ProductImage
├─ ProductName
├─ ProductPrice
└─ RecommendationReason
```

---

## 5-2. 가로 배치

예:

```text
[아이콘]   상품명   92%
```

구조:

```text
ProductInfo [Horizontal Auto Layout]

├─ ProductIcon
├─ ProductName
└─ MatchBadge
```

---

## 5-3. Bottom Navigation

```text
Home    Closet    Style    Profile
```

→ **Horizontal Auto Layout**

---

## 5-4. 화면 전체

가능하면 화면 자체도 다음처럼 구성합니다.

```text
05_MCMRecommendation [Vertical]

├─ Header
├─ Content
└─ BottomNavigation
```

---

# 6. Frame 이름 규칙

## ❌ 사용하지 않기

```text
Frame 192
Rectangle 82
Group 32
Text 55
```

## ✅ 역할이 드러나는 이름 사용

### 화면 이름

```text
00_Splash
01_Onboarding
02_ClosetScan
03_ClosetScanResult
04_StyleDNA
05_MCMRecommendation
06_ProductDetail
07_ARPreview
08_Checkout
```

### 화면 영역

```text
Header
Content
HeroSection
ProductSection
RecommendationSection
ActionSection
BottomNavigation
```

### UI 요소

```text
ProductCard
ClosetCard
MoodCard

ProductImage
ProductName
ProductPrice

MatchBadge

PrimaryButton
SecondaryButton

ProfileImage

SearchInput
EmailInput
```

---

# 7. 레이어 이름은 영어로 통일

개발 전달용 **Layer 이름은 영어로 통일**합니다.

실제 화면에 보이는 글자는 한글이어도 됩니다.

예:

```text
Layer 이름
ProductName

화면 표시 문구
"Stark Side Studs Backpack"
```

---

# 8. Component 이름 규칙

관련 Component는 `/`를 사용해 정리합니다.

```text
Button/Primary
Button/Secondary

Badge/Match
Badge/Certified

Card/Product
Card/Closet
Card/Mood

Navigation/Bottom

Icon/Home
Icon/Closet
Icon/Style
Icon/Profile
```

---

# 9. Component는 언제 만들까?

### 가장 쉬운 기준

> **같은 UI가 두 번 이상 나오면 Component 후보입니다.**

MCM MUSE에서 최소 다음 요소는 Component로 관리합니다.

| Component | 사용 예 |
|---|---|
| `Button/Primary` | 분석하기, 구매하기 |
| `Button/Secondary` | 다시 하기 |
| `Navigation/Bottom` | 앱 주요 화면 |
| `Card/Product` | MCM 추천 상품 |
| `Card/Closet` | 내 옷장 아이템 |
| `Card/Mood` | 무드 선택 |
| `Badge/Match` | 매칭 92% |
| `Badge/Certified` | MCM 정품 인증 |
| `Input/Text` | 로그인/회원가입 |

---

# 10. 반복 UI는 복사 대신 Instance 사용

## ❌ 각각 따로 복사해서 만들기

```text
ProductCard
ProductCard
ProductCard
```

각각 독립 Frame으로 만들면 나중에 디자인 수정 시 전부 직접 고쳐야 합니다.

## ✅ Component + Instance

```text
RecommendationList

├─ Card/Product [Instance]
├─ Card/Product [Instance]
└─ Card/Product [Instance]
```

원본 Component를 한 번 수정하면 관련 Instance에도 변경 사항을 반영할 수 있습니다.

---

# 11. 상태가 다른 UI는 Variant 사용

예를 들어 버튼에 상태가 있다면:

```text
Default
Pressed
Disabled
Loading
```

를 각각 별도 Component로 만들지 않고 Variant로 관리합니다.

예:

```text
Button/Primary

State =
Default
Pressed
Disabled
Loading
```

### 초보 단계에서 먼저 적용할 곳

- Button
- Input
- Bottom Navigation
- Tab
- Badge

모든 Component에 Variant를 만들 필요는 없습니다.

---

# 12. Color 규칙

화면마다 색상 값을 직접 반복 입력하지 않습니다.

예:

```text
Color/Brand/Primary
Color/Brand/Secondary

Color/Bg/Primary
Color/Bg/Card

Color/Text/Primary
Color/Text/Secondary

Color/Border/Default

Color/State/Error
Color/State/Success
```

### ❌ 피하기

```text
화면 A → #705C39
화면 B → #705C39
화면 C → #705C39
```

### ✅ 권장

```text
Color/Brand/Primary
```

하나를 정의하고 공통 적용합니다.

---

# 13. Spacing 규칙

화면마다 임의의 간격을 만들지 않습니다.

예시:

```text
Space/4
Space/8
Space/12
Space/16
Space/24
Space/32
```

### 예

```text
카드 내부 Padding
→ Space/16

카드 사이 Gap
→ Space/12

Section 사이 Gap
→ Space/24
```

정확한 값은 현재 디자인에 맞춰 한 번 결정하면 됩니다.

---

# 14. Radius 규칙

예시:

```text
Radius/Small    8
Radius/Medium   12
Radius/Large    20
Radius/Pill     999
```

화면마다 임의의 `11px`, `17px`, `19px` 등을 만드는 것은 피합니다.

---

# 15. Typography 규칙

최소 다음 정도만 구분합니다.

```text
Typography/Display
Typography/Heading/L
Typography/Heading/M

Typography/Body/M
Typography/Body/S

Typography/Caption
Typography/Button
```

처음부터 너무 많은 종류를 만들 필요는 없습니다.

---

# 16. 이미지 레이어 이름

이미지는 역할을 바로 알 수 있게 이름을 붙입니다.

## ❌

```text
Rectangle 17
Image 3
```

## ✅

```text
ProductImage
ClosetItemImage
MascotImage
ProfileImage
```

고정 Asset이라면:

```text
Mascot/Brown
Logo/MCM
```

처럼 조금 더 구체적으로 이름을 붙여도 됩니다.

---

# 17. Icon 이름

아이콘도 가능하면 Component로 관리합니다.

```text
Icon/Home
Icon/Closet
Icon/Style
Icon/Profile
Icon/Back
Icon/Close
Icon/Heart
Icon/Search
```

아이콘 내부 Vector 이름까지 모두 정리할 필요는 없습니다.

```text
Icon/Home

├─ Vector
└─ Vector
```

이 정도면 충분합니다.

---

# 18. MCM 상품 카드 구조 예시

```text
Card/Product [Vertical Auto Layout]

├─ ProductImage
│
├─ ProductInfo [Vertical Auto Layout]
│   │
│   ├─ ProductName
│   ├─ ProductPrice
│   │
│   └─ MatchInfo [Horizontal Auto Layout]
│       ├─ MatchBadge
│       └─ MatchText
│
└─ CuratorMessage
```

화면에서는:

```text
RecommendationList [Vertical Auto Layout]

├─ Card/Product
├─ Card/Product
└─ Card/Product
```

---

# 19. 옷장 카드 구조 예시

```text
Card/Closet

├─ ClosetItemImage
├─ ItemInfo
│   ├─ ItemName
│   └─ Category
└─ SourceBadge
```

예:

```text
SourceBadge

내 옷
MCM
Archive
```

---

# 20. 추천 화면 전체 구조 예시

`05_MCMRecommendation`을 예로 들면:

```text
05_MCMRecommendation

├─ Header
│   ├─ BackButton
│   └─ PageTitle
│
├─ Content [Vertical Auto Layout]
│   │
│   ├─ StyleSummary
│   │   ├─ Title
│   │   └─ TasteBadgeList
│   │
│   ├─ RecommendationIntro
│   │   ├─ Title
│   │   └─ Description
│   │
│   └─ RecommendationList
│       ├─ Card/Product
│       ├─ Card/Product
│       └─ Card/Product
│
└─ Navigation/Bottom
```

이 정도 구조면 개발자도 바로 다음처럼 이해할 수 있습니다.

```text
Page
Header
Content
ProductList
ProductCard
BottomNavigation
```

---

# 21. 실제 데이터 길이를 고려해 디자인

최종 프로덕트에서는 짧은 예시 텍스트만 넣고 끝내면 안 됩니다.

예:

### 짧은 상품명

```text
Aren Shoulder Bag
```

### 긴 상품명

```text
Stark Backpack in Visetos with Side Studs
```

둘 다 넣어보고 UI가 깨지지 않는지 확인합니다.

---

# 22. 주요 화면 상태도 함께 디자인

최종 프로덕트에서는 **정상 상태(Default)만 디자인하면 부족합니다.**

중요 기능은 최소 다음 상태를 고려합니다.

## 옷장 스캔

```text
Default
Image Selected
Loading
Analysis Failed
```

## 추천

```text
Default
Loading
No Recommendation
AI Error
```

## 옷장

```text
Default
Empty
Loading
```

## Button

```text
Default
Pressed
Disabled
Loading
```

## Input

```text
Default
Focus
Filled
Error
```

## Image

```text
Loaded
Loading
Failed
```

모든 상태를 별도 화면으로 만들 필요는 없습니다.

Component Variant 또는 같은 Section 안에서 상태별 예시를 관리하면 됩니다.

---

# 23. Annotation 작성 규칙

디자인만 보고 동작을 알 수 없는 경우에만 간단한 설명을 남깁니다.

## 예시 1 — 구매

```text
[구매하기]

구매 완료 시:
1. 구매 상품을 사용자 옷장에 추가
2. 나의 옷장 화면으로 이동
```

## 예시 2 — AI 분석

```text
[분석하기]

1. 선택한 사진을 서버로 전송
2. 분석 중 Loading 상태
3. 완료 후 옷장 인식 결과 화면으로 이동
```

### Annotation이 필요한 경우

- 클릭 후 이동 위치가 애매한 경우
- Loading이 필요한 경우
- Modal/Bottom Sheet가 뜨는 경우
- 특정 조건에 따라 버튼 상태가 바뀌는 경우
- 개발자가 디자인만 보고 동작을 알기 어려운 경우

모든 요소에 설명을 붙일 필요는 없습니다.

---

# 24. 화면 이름은 중복하지 않기

## ❌

```text
4-b 로그인
4-b 로그인
4-b 회원가입
```

## ✅

```text
04_StyleDNA

04A_LoginRequest
04B_Login
04C_SignUp
```

각 Frame은 고유한 이름을 사용합니다.

---

# 25. 현재 기존 Figma를 수정하는 방법

기존 디자인을 처음부터 다시 그릴 필요는 없습니다.

현재:

```text
05_MCM제품추천

└─ 디자인 수정
   ├─ 요소
   ├─ 요소
   ├─ 요소
   ├─ 요소
   ├─ 요소
   └─ ...
```

라면 현재 화면을 유지하면서 **의미별 Frame으로 다시 묶습니다.**

예:

```text
05_MCMRecommendation

├─ Header
│
├─ Content
│   ├─ RecommendationIntro
│   └─ RecommendationList
│       ├─ Card/Product
│       ├─ Card/Product
│       └─ Card/Product
│
└─ Navigation/Bottom
```

### 수정 순서

```text
기존 디자인 유지
        ↓
큰 UI 덩어리 선택
        ↓
Frame으로 묶기
        ↓
의미 있는 이름 지정
        ↓
Auto Layout 적용
        ↓
반복 요소 Component화
```

---

# 26. 기존 `디자인 수정` 레이어는 어떻게 할까?

기존에 모든 요소가:

```text
Screen
└─ 디자인 수정
   └─ ...
```

아래에 있다면 최종적으로는 `디자인 수정` 같은 임시 레이어명을 제거하는 것을 권장합니다.

### 기존

```text
05_MCMRecommendation
└─ 디자인 수정
   ├─ Header
   ├─ ProductCard
   └─ BottomNavigation
```

### 최종

```text
05_MCMRecommendation
├─ Header
├─ Content
└─ Navigation/Bottom
```

즉 **화면 Frame 자체가 최상위 UI 컨테이너가 되게 정리합니다.**

---

# 27. 최종 프로덕트에서 피해야 할 것

| 하지 말 것 | 대신 |
|---|---|
| 모든 요소를 화면 바로 아래 평평하게 배치 | 의미별 Frame |
| `Frame 124` | `ProductCard` |
| `Rectangle 32` | `ProductImage` |
| 반복 UI 복붙 | Component Instance |
| 요소마다 직접 좌표 조절 | Auto Layout |
| 화면마다 임의 색상 | Variables |
| 화면마다 다른 버튼 | Button Component |
| UI 구조에 Group 남발 | Frame |
| 모든 요소 absolute 배치 | Auto Layout 중심 |
| 짧은 Text만 테스트 | 실제 길이 Variation 확인 |
| Default 화면만 제작 | Loading/Empty/Error 고려 |
| 화면 이름 중복 | 고유한 Screen Name |

---

# 28. 디자이너 작업 순서

초보 디자이너라면 아래 순서대로 진행하면 됩니다.

## STEP 1. 화면 Frame 만들기

```text
05_MCMRecommendation
```

---

## STEP 2. 화면을 큰 영역으로 나누기

```text
Header
Content
BottomNavigation
```

---

## STEP 3. Content를 다시 의미별로 나누기

```text
Content

├─ StyleSummary
├─ RecommendationIntro
└─ RecommendationList
```

---

## STEP 4. 가로/세로 배치에 Auto Layout 적용

선택 후:

```text
Shift + A
```

---

## STEP 5. 반복 UI를 Component로 만들기

```text
ProductCard
Button
BottomNavigation
ClosetCard
```

---

## STEP 6. 레이어 이름 정리

```text
Frame 23
Rectangle 72
```

같은 이름을:

```text
ProductCard
ProductImage
```

로 변경합니다.

---

## STEP 7. 공통 디자인 값 적용

```text
Color
Typography
Spacing
Radius
```

---

## STEP 8. 화면 크기/텍스트를 바꿔보기

다음 상황을 테스트합니다.

- 텍스트가 길어짐
- 카드 개수가 늘어남
- 상품명이 두 줄이 됨
- 화면 높이가 달라짐

---

## STEP 9. 주요 상태 추가

```text
Loading
Empty
Error
Disabled
```

---

## STEP 10. 애매한 동작에 Annotation 작성

필요한 곳에만 작성합니다.

---

# 29. 화면 하나 완료 체크리스트

화면 하나를 끝낼 때 아래만 확인하면 됩니다.

- [ ] 화면이 독립된 Frame인가?
- [ ] Header / Content / BottomNavigation 등 큰 영역이 Frame으로 구분되어 있는가?
- [ ] 세로/가로 배치에 Auto Layout이 적용되어 있는가?
- [ ] 반복되는 UI는 Component Instance를 사용했는가?
- [ ] `Frame 123`, `Group 32`, `Rectangle 71` 같은 이름이 남아 있지 않은가?
- [ ] 이미지와 아이콘이 어떤 역할인지 이름으로 알 수 있는가?
- [ ] Color / Typography / Spacing / Radius가 공통 기준을 사용하고 있는가?
- [ ] 긴 텍스트가 들어가도 UI가 크게 무너지지 않는가?
- [ ] Loading / Empty / Error 등 필요한 상태가 고려되어 있는가?
- [ ] 클릭 후 동작이 애매한 곳에 Annotation이 있는가?
- [ ] 임시 `디자인 수정` 레이어가 최종 구조에 남아 있지 않은가?

---

# 30. 빠른 판단 기준

작업하다 헷갈리면 아래 기준만 사용하면 됩니다.

### 이걸 Frame으로 묶어야 하나?

> **하나의 UI 덩어리인가?**

YES → Frame

---

### Auto Layout을 써야 하나?

> **가로 또는 세로 방향으로 요소가 나열되어 있는가?**

YES → Auto Layout

---

### Component로 만들어야 하나?

> **다른 화면에서 한 번 더 나오는가?**

YES → Component 후보

---

### 이름을 바꿔야 하나?

> **레이어 이름만 보고 무엇인지 알 수 있는가?**

NO → 이름 변경

---

### 상태 화면을 만들어야 하나?

> **데이터/API/사용자 입력에 따라 모양이 달라지는가?**

YES → 상태 디자인 고려

---

# 31. 최종 목표

최종 Figma는 단순히 그림이 예쁜 파일이 아니라 다음 구조가 보여야 합니다.

```text
Screen
│
├─ Header
│
├─ Content
│   │
│   ├─ Section
│   │   └─ Component
│   │
│   └─ Section
│       └─ Component
│
└─ BottomNavigation
```

이렇게 정리해두면:

```text
Figma
  ↓
Figma MCP
  ↓
Codex / 개발자
  ↓
Frontend Component
```

로 옮길 때 구조를 다시 해석하는 비용을 크게 줄일 수 있습니다.

---

# 한 줄 요약

> **화면은 Frame, 큰 UI는 Frame, 반복 UI는 Component, 나열은 Auto Layout, 이름은 역할이 보이게.**

이 다섯 가지만 꾸준히 지키면 개발 전달에 충분히 좋은 Figma 구조를 만들 수 있습니다.
