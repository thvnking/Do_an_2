# CineMind — Frontend Design System

**Version:** 1.0  
**Status:** Design Direction Approved  
**Design Direction:** Community Cinematic × Editorial Cinema

## 1. Design Philosophy

CineMind combines two visual approaches.

### Community Cinematic

Inspired by movie diary and film community experiences:
- Movie posters.
- Ratings.
- Reviews.
- Watchlists.
- User profiles.
- Community activity.

### Editorial Cinema

Inspired by modern cinema magazines:
- Elegant typography.
- Cinematic photography.
- Large editorial headlines.
- Asymmetric layouts.
- Generous whitespace.
- Carefully structured long-form content.

Core principle:

> Community is the soul. Editorial is the visual language.

CineMind is a cinema community platform, not a streaming service.

## 2. Brand Personality

- Sophisticated.
- Cinematic.
- Thoughtful.
- Community-driven.
- Editorial.
- Contemporary.

Avoid childish visuals, excessive gamification, excessive glow, and generic streaming-service layouts.

## 3. Color Tokens

| Token | Value | Usage |
|---|---|---|
| `--color-bg-primary` | `#0B0B0D` | Main background |
| `--color-bg-secondary` | `#131316` | Section background |
| `--color-bg-card` | `#19191E` | Cards |
| `--color-bg-elevated` | `#222228` | Elevated surfaces |
| `--color-text-primary` | `#F2F0EC` | Main text |
| `--color-text-secondary` | `#A3A0A0` | Secondary text |
| `--color-text-muted` | `#77747A` | Metadata |
| `--color-accent` | `#D4B779` | Champagne gold accent |
| `--color-border` | `#303036` | Borders |
| `--color-success` | `#6FB28B` | Success |
| `--color-warning` | `#D9A85F` | Warning |
| `--color-danger` | `#D56C6C` | Error |
| `--color-info` | `#7FA9C9` | Information |

Color rules:
- Gold is an accent, not the dominant background.
- Do not color every icon, button, and link gold.
- Use subtle borders.
- Avoid unnecessary gradients.
- Use dark image overlays when text appears over photography.
- Maintain readable contrast.

## 4. Typography

### Editorial Serif
Proposed font: Playfair Display or equivalent.

Use for:
- Hero titles.
- Page titles.
- Blog titles.
- Editorial headings.
- Featured quotations.

### Interface Sans-serif
Proposed font: Inter or equivalent.

Use for:
- Navigation.
- Body text.
- Buttons.
- Forms.
- Metadata.
- Ratings.
- Admin UI.

Test Vietnamese diacritics and available font weights before finalizing production fonts.

### Type Scale

| Token | Size |
|---|---:|
| `--text-xs` | 12px |
| `--text-sm` | 14px |
| `--text-base` | 16px |
| `--text-lg` | 18px |
| `--text-xl` | 20px |
| `--text-2xl` | 24px |
| `--text-3xl` | 30px |
| `--text-4xl` | 40px |
| `--text-5xl` | 48px |
| `--text-6xl` | 64px |

Use tighter line-height for headings and comfortable line-height for body text.

Blog reading width should generally be around 680–760px.

## 5. Spacing

Use a 4px-based spacing scale.

| Token | Value |
|---|---:|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-10` | 40px |
| `--space-12` | 48px |
| `--space-16` | 64px |
| `--space-20` | 80px |
| `--space-24` | 96px |

Use small spacing for related controls, medium spacing for components, and large spacing between page sections.

## 6. Layout and Grid

Container:
- Mobile: full width, 16px side padding.
- Tablet: full width, 24px side padding.
- Desktop: max-width 1280px.
- Wide desktop: max-width 1440px.

Movie grid:
- Mobile: 2 columns.
- Tablet: 3–4 columns.
- Desktop: 5–6 columns depending on available width.

Blog grid:
- Mobile: 1 column.
- Tablet: 2 columns.
- Desktop: 2–3 columns.

Editorial layouts may use asymmetric columns and featured content.

## 7. Radius and Surfaces

| Token | Value |
|---|---:|
| `--radius-sm` | 4px |
| `--radius-md` | 8px |
| `--radius-lg` | 12px |
| `--radius-xl` | 16px |
| `--radius-2xl` | 24px |
| `--radius-full` | 9999px |

Prefer subtle borders and background differences over heavy shadows.

Movie posters must preserve their original aspect ratio and should not be excessively rounded.

## 8. Image System

### Movie Poster
- Aspect ratio: 2:3.
- Use `object-fit: cover`.
- Never stretch or distort.
- Reserve image dimensions to prevent layout shifts.
- Provide loading and error fallbacks.

### Movie Backdrop
- Use for movie detail heroes and featured movie sections.
- Prefer wide cinematic images.
- Use a dark overlay when text is placed on top.
- Maintain readable contrast.

### Blog Thumbnail
- Default aspect ratio: 16:9.
- Featured editorial content may use a different ratio.
- Use high-quality imagery.

### Image Loading
Important images need:
- Loading placeholders.
- Error fallbacks.
- Stable dimensions.
- Lazy loading where appropriate.

## 9. Shared Components

### Buttons
Types:
- Primary.
- Secondary.
- Ghost.
- Danger.

States:
- Default.
- Hover.
- Active.
- Focus.
- Disabled.
- Loading.

### Movie Card
Contains:
- Poster.
- Title.
- Release year.
- Rating when available.
- Optional genre metadata.

Interactions:
- Open movie detail.
- Optional watchlist action.
- Subtle hover state.

### Review Card
Contains:
- Avatar.
- Username.
- Rating.
- Optional review title.
- Review content.
- Movie reference.
- Like count.
- Comment count.
- Timestamp.

Long reviews should support controlled expansion.

### Blog Card
Contains:
- Cover image.
- Category.
- Title.
- Excerpt.
- Author.
- Published date.

Featured blog cards may have a larger editorial layout.

### Rating
- 1–5 stars.
- Display and interactive variants.
- Empty, hover, selected, and keyboard states.
- Never invent a rating when data is unavailable.

### Form Components
- Text input.
- Textarea.
- Search.
- Select.
- Checkbox.
- Radio.
- Password.
- File upload.

Every input needs an accessible label and relevant states.

### Modal
- Close control.
- Keyboard support.
- Focus management.
- Appropriate confirmation for destructive actions.

### Toast
- Success.
- Error.
- Warning.
- Information.

### Skeleton
Use structured skeletons for movie grids, blog lists, and review lists.

## 10. Navigation

### Public Header
- Logo.
- Home.
- Movies.
- Blogs.
- CineMind AI.
- Search.
- Login or User Menu.

### User Menu
- Profile.
- Watchlist.
- My Reviews.
- My Blogs.
- Settings.
- Logout.

### Admin Sidebar
- Dashboard.
- Users.
- Movies.
- Blog Moderation.
- Analytics.
- Logout.

## 11. Page Visual Direction

| Page | Direction |
|---|---|
| Home | Editorial + Community |
| Movie Discovery | Community Cinematic |
| Movie Detail | Hybrid |
| Blog Discovery | Editorial |
| Blog Detail | Digital Magazine |
| Profile | Community Cinematic |
| Watchlist | Community Cinematic |
| AI Assistant | Modern Editorial |
| Admin | Functional Minimal Dark |

## 12. Motion

Motion must be subtle and purposeful.

Suggested timings:
- Hover: 150–200ms.
- Button: 120–180ms.
- Dropdown: 150–200ms.
- Modal: 180–240ms.
- Page transition: 200–300ms.

Respect `prefers-reduced-motion`.

Hover effects must not be required to access functionality.

## 13. Responsive Breakpoints

| Name | Width |
|---|---|
| Mobile | 0–639px |
| Tablet | 640–1023px |
| Desktop | 1024–1439px |
| Wide | 1440px and above |

Mobile:
- Two-column movie grid.
- One-column blog grid.
- Full-width forms.
- Mobile navigation.
- No horizontal overflow.
- Touch-friendly controls.

Tablet:
- Adapt grid columns.
- Collapse sidebars when necessary.
- Simplify complex editorial compositions.

Desktop:
- Use constrained containers.
- Allow asymmetric editorial layouts.
- Support sidebar and main-content compositions.

## 14. Accessibility

- Use semantic HTML.
- Use links for navigation and buttons for actions.
- Label all form controls.
- Provide visible keyboard focus.
- Use meaningful image alt text.
- Support keyboard navigation in dialogs.
- Do not communicate state through color alone.
- Maintain readable contrast.
- Respect reduced motion.

## 15. CSS Architecture

Suggested files:

```text
src/styles/
  tokens.css
  reset.css
  typography.css
  global.css
  utilities.css
  index.css
```

Rules:
- Define shared tokens centrally.
- Avoid duplicated hardcoded values.
- Keep component styles close to their components or features.
- Avoid broad global selectors.
- Avoid uncontrolled CSS overrides.
- Follow a consistent naming convention.

## 16. Starter CSS Tokens

```css
:root {
  --color-bg-primary: #0B0B0D;
  --color-bg-secondary: #131316;
  --color-bg-card: #19191E;
  --color-bg-elevated: #222228;

  --color-text-primary: #F2F0EC;
  --color-text-secondary: #A3A0A0;
  --color-text-muted: #77747A;

  --color-accent: #D4B779;
  --color-accent-hover: #E1C991;

  --color-success: #6FB28B;
  --color-warning: #D9A85F;
  --color-danger: #D56C6C;
  --color-info: #7FA9C9;

  --color-border: #303036;

  --font-editorial: "Playfair Display", Georgia, serif;
  --font-interface: "Inter", Arial, sans-serif;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-full: 9999px;

  --container-max: 1280px;
  --container-wide: 1440px;

  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
}
```

## 17. Open Design Decisions

These remain proposals:
- Final serif and sans-serif font choices.
- Final logo design.
- Icon library.
- Pagination versus infinite scroll.
- Light mode support.
- Detailed mobile navigation behavior.
- Blog editor technology.

Do not treat proposals as approved decisions.

## 18. Acceptance Criteria

- Shared color tokens are used consistently.
- Typography is consistent.
- Spacing and radius follow the system.
- Movie, Review, and Blog cards have distinct appropriate designs.
- Navigation is consistent.
- Admin has a separate layout.
- Components include interaction states.
- Images have loading and fallback states.
- Responsive layouts have no unintended horizontal overflow.
- Basic accessibility requirements are met.
- The overall interface reflects Community Cinematic × Editorial Cinema.