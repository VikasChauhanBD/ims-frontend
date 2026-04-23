# Loading Components Quick Reference

## Two Options Available

### Option 1: CSS Spinner (Lightweight)
```jsx
import LoadingSpinner from "../../common/LoadingSpinner";

// Full-screen overlay
<LoadingSpinner fullScreen={true} message="Processing..." />

// Inline display
<LoadingSpinner fullScreen={false} message="Loading data..." />
```

**When to Use:**
- Authentication flows
- Route protection
- Modal operations
- Clean, minimalist design
- No external dependencies

---

### Option 2: GIF Animation (Visual)
```jsx
import LoadingGif from "../../common/LoadingGif";

// With size options
<LoadingGif size="medium" message="Loading..." />
<LoadingGif size="small" />
<LoadingGif size="large" />
```

**When to Use:**
- Long-running operations
- Data fetching/refreshing
- More visual feedback needed
- Professional appearance

---

## Responsive Sizing Guide

| Device | Spinner Size | GIF Size (medium) |
|--------|-------------|-------------------|
| Desktop (≥1024px) | 80px | 120px |
| Tablet (768-1023px) | 70px | 110px |
| Mobile (≤767px) | 50px | 80px |
| Extra Small (≤480px) | 45px | 70px |

---

## Common Patterns

### Authentication Loading
```jsx
import LoadingSpinner from "../../common/LoadingSpinner";

function ProtectedRoute({ children }) {
  const { loading } = useAuth();
  if (loading) {
    return <LoadingSpinner fullScreen={true} message="Authenticating..." />;
  }
  return children;
}
```

### Form Submission
```jsx
{loading ? (
  <LoadingSpinner message="Submitting..." />
) : (
  <form onSubmit={handleSubmit}>
    {/* form fields */}
  </form>
)}
```

### Page Data Loading
```jsx
if (isLoading) {
  return <LoadingSpinner fullScreen={false} message="Loading profile..." />;
}
```

### Modal Operations
```jsx
<div className="modal-loading">
  <LoadingSpinner message="Creating employee..." />
</div>
```

---

## Files Structure

```
src/components/common/
├── LoadingSpinner.jsx       // CSS-based spinner
├── LoadingSpinner.css       // Responsive styling
├── LoadingGif.jsx           // GIF-based loader
└── LoadingGif.css           // Responsive styling

public/
└── loading.gif              // Animation asset
```

---

## Color Customization

Edit `LoadingSpinner.css` to change colors:

```css
.spinner {
  border: 5px solid #f0f0f0;        /* Border color */
  border-top: 5px solid #3b82f6;    /* Accent color (blue) */
}
```

---

## Message Text Customization

All components accept a `message` prop:

```jsx
<LoadingSpinner message="Your custom message here" />
<LoadingGif message="Loading devices..." />
```

---

## Testing Responsive Design

1. Open DevTools (F12)
2. Click "Toggle device toolbar" (Ctrl+Shift+M)
3. Test different screen sizes:
   - Desktop: 1024px+
   - Tablet: 768-1024px
   - Mobile: 375-767px
   - Extra Small: <375px

---

## Performance Tips

1. **CSS Spinner:** Preferred for small operations (lightweight, GPU-accelerated)
2. **GIF Loader:** Use for longer operations or when visual feedback is important
3. **Avoid Multiple Loaders:** Don't show multiple loading indicators simultaneously
4. **Disable Interactions:** Disable form buttons/inputs during loading
5. **Set Timeouts:** Clear loading states after reasonable wait times

---

## Accessibility

- Both components have semantic HTML structure
- LoadingGif includes alt text
- Text contrast meets WCAG standards
- Animations respect prefers-reduced-motion (consider adding)
- Both avoid flashing content

---

## Browser Support

- Chrome/Edge: ✓ Full support
- Safari: ✓ Full support (iOS 12+)
- Firefox: ✓ Full support
- IE 11: ⚠ Limited (animations may not work)

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Spinner not visible | Check z-index or fullScreen prop |
| Message not showing | Verify message prop is passed |
| GIF not loading | Check `/public/loading.gif` exists |
| Wrong size on mobile | Verify CSS media queries loaded |
| Spinner too slow | Adjust animation duration in CSS |

---

## Examples by Use Case

### Sign Up/Login
```jsx
const [loading, setLoading] = useState(false);

if (loading) {
  return <LoadingSpinner fullScreen={true} message="Authenticating..." />;
}
```

### Employee Management
```jsx
<AddEmployeeModal>
  {loading ? (
    <LoadingSpinner message="Creating employee..." />
  ) : (
    <EmployeeForm />
  )}
</AddEmployeeModal>
```

### Device List
```jsx
const [loading, setLoading] = useState(true);

if (loading) {
  return <LoadingSpinner fullScreen={false} message="Loading devices..." />;
}
return <DeviceList />;
```

### Profile Updates
```jsx
{isUpdating && <LoadingGif size="small" message="Saving changes..." />}
```

---

## Next Steps

1. ✅ Components implemented
2. ✅ Responsive sizing added
3. ✅ Integration in key components
4. 📝 Add dark mode support
5. 📝 Add progress indicators
6. 📝 Add skeleton screens

---

**Last Updated:** 2024
**Version:** 1.0
**Status:** Production Ready ✓
