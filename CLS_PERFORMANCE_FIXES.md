# CLS Performance Fixes - Summary

## Problem Identified
The page had a Cumulative Layout Shift (CLS) score of **0.147**, primarily caused by:
1. **Homepage Template DOM Restructuring** (0.129) - The #bg-main div was created and content moved after it was already visible
2. **Header Navigation Loading** (0.018) - Header elements shifting during load

## Solutions Implemented

### 1. Template Loading Sequence Optimization (`scripts/scripts.js`)

**Before:** Content was shown before template restructured the DOM
```javascript
decorateMain(main);
document.body.classList.add('appear'); // Shows content
await templateCSSPromise;
await loadSections(main);
await loadTemplate(doc, templateName); // Too late - already visible!
```

**After:** Template runs BEFORE content is shown
```javascript
decorateMain(main);
await templateCSSPromise;
await loadSections(main);
await loadTemplate(doc, templateName); // Restructure DOM first
document.body.classList.add('appear'); // NOW show content
```

**Impact:** Eliminates the main CLS by hiding content until template restructuring is complete.

---

### 2. Content Visibility Strategy (`styles/styles.css`)

**Before:** Used `opacity: 0` which still reserved space
```css
body.homepage > *:not(header):not(footer) {
  opacity: 0;
  pointer-events: none;
}
```

**After:** Used `visibility: hidden` + `position: absolute` to completely remove from layout
```css
body.homepage > *:not(header):not(footer) {
  visibility: hidden;
  position: absolute;
  pointer-events: none;
}

body.homepage.template-loaded > * {
  visibility: visible;
  position: static;
  pointer-events: auto;
}
```

**Impact:** Content doesn't reserve any space until template is loaded, preventing shifts.

---

### 3. Header Space Reservation (`styles/styles.css`)

**Before:** No minimum height
```css
header {
  min-height: 0;
}
```

**After:** Reserved space for header
```css
header {
  min-height: 180px; /* Mobile */
}

@media (min-width: 960px) {
  header {
    min-height: 220px; /* Desktop */
  }
}
```

**Impact:** Prevents header from shifting when it loads.

---

### 4. Homepage Template Space Reservations (`templates/homepage/homepage.css`)

#### #bg-main Container
```css
.homepage-template #bg-main {
  min-height: 1200px; /* Mobile */
  contain: layout; /* Prevent layout shifts */
}

@media (min-width: 768px) {
  .homepage-template #bg-main {
    min-height: 1800px; /* Tablet */
  }
}

@media (min-width: 960px) {
  .homepage-template #bg-main {
    min-height: 2200px; /* Desktop */
  }
}
```

#### Left Navigation Container
```css
.homepage-template #leftNavContainer {
  min-height: 200px; /* Mobile */
  contain: layout;
}

@media (min-width: 768px) {
  .homepage-template #leftNavContainer {
    min-height: 500px; /* Tablet */
  }
}

@media (min-width: 960px) {
  .homepage-template #leftNavContainer {
    min-height: 600px; /* Desktop */
  }
}
```

#### Main Content Area
```css
.homepage-template .col-md-9 main {
  min-height: 600px; /* Mobile */
  contain: layout;
}

@media (min-width: 768px) {
  .homepage-template .col-md-9 main {
    min-height: 1200px; /* Tablet */
  }
}

@media (min-width: 960px) {
  .homepage-template .col-md-9 main {
    min-height: 1500px; /* Desktop */
  }
}
```

**Impact:** Reserves appropriate space for content containers to prevent collapse and shifts.

---

### 5. Header Component Fixes (`blocks/header/header.css`)

#### Logo Dimensions
```css
header nav .nav-brand img {
  height: 32px; /* Mobile - explicit height */
  width: auto;
  max-width: 264px;
}

@media screen and (min-width: 768px) {
  header nav .nav-brand img {
    height: 40px; /* Tablet */
  }
}

@media screen and (min-width: 960px) {
  header nav .nav-brand img {
    height: 45px; /* Desktop */
  }
}
```

#### Tools List Space Reservation
```css
header nav .nav-brand .logo-tools-wrapper > ul {
  min-height: 120px; /* Mobile - reserve space */
}

@media screen and (min-width: 960px) {
  header nav .nav-brand .logo-tools-wrapper > ul {
    min-height: 0; /* Not needed on desktop */
  }
}
```

**Impact:** Prevents header elements from shifting as they load.

---

## Expected Results

### CLS Improvements
- **Target CLS:** < 0.1 (good)
- **Previous CLS:** 0.147 (needs improvement)
- **Main fix:** Eliminated 0.129 layout shift from #bg-main
- **Secondary fix:** Eliminated 0.018 shift from header

### Performance Metrics
- **LCP (Largest Contentful Paint):** 0.5s (already good, maintained)
- **FCP (First Contentful Paint):** 0.3s (already good, maintained)
- **TBT (Total Blocking Time):** 0ms (already excellent, maintained)

### Key Strategies Used
1. ✅ **CSS `contain: layout`** - Isolates layout changes
2. ✅ **Visibility-based hiding** - Removes from layout completely
3. ✅ **Minimum height reservations** - Prevents container collapse
4. ✅ **Explicit image dimensions** - Prevents image-based shifts
5. ✅ **Optimized load sequence** - Template runs before content shows
6. ✅ **Font preloading** - Already in place, prevents font-swap shifts

## Testing Instructions

1. Run PageSpeed Insights on the homepage
2. Check CLS score - should be < 0.1
3. Visually verify no layout shifts occur:
   - Header stays in place
   - Content doesn't jump when template loads
   - Images don't cause shifts
4. Test on mobile and desktop viewports
5. Test with slow 3G throttling to catch any timing issues

## Files Modified

1. `/scripts/scripts.js` - Template loading sequence
2. `/styles/styles.css` - Content hiding strategy, header min-height
3. `/templates/homepage/homepage.css` - Space reservations for template containers
4. `/blocks/header/header.css` - Logo dimensions and tools list space

## Additional Recommendations

1. **Image optimization:** Ensure all images have explicit width/height attributes in HTML
2. **Font loading:** Consider using `font-display: optional` for non-critical fonts
3. **Lazy loading:** Ensure carousel images use eager loading (already done)
4. **Monitoring:** Set up Real User Monitoring (RUM) to track CLS in production
