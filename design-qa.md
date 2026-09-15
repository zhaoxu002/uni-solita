# Design QA — Mobile Admin Center

- Source visual truth path: `D:\CODE\uni-solita\design-reference-admin-dashboard.png`
- Implementation: `http://localhost:4173/#/pages/admin/index`
- Implementation screenshot: Codex in-app browser inline capture, tab 3, captured 2026-09-15 at a 390 × 844 viewport (the browser integration did not expose a filesystem export path).
- Source pixels: 852 × 1850.
- Implementation viewport/CSS size: 390 × 844 at device scale 1.
- Density normalization: source reviewed at 390 px CSS width (approximately 2.185 source pixels per CSS pixel); implementation reviewed at native CSS size.
- State: H5-only preview data with 3 total campaigns, 2 active campaigns, 1 upcoming campaign, and 2 low-stock products. Production Mini Program builds exclude the preview fixtures.

**Findings**

- No actionable P0, P1, or P2 visual differences remain.
- Typography: the implementation preserves the source hierarchy with a 30 px display title, 19 px section headings, 16 px item titles, and readable 11–13 px metadata. System Chinese sans-serif fallback is appropriate for the WeChat surface.
- Spacing and layout: the 16 px page gutter, grouped white list surfaces, 14–16 px radii, lightweight separators, and 44 px or larger primary touch targets reproduce the selected direction without nested cards.
- Colors: the white / `#f7f9fa` base, pink `#f36f7b` action color, pale pink status surfaces, dark navy text, and muted gray metadata map closely to the reference.
- Image quality: production rows use the campaign's real cloud image with `aspectFill`. The H5 fixture uses existing repository brand imagery, so exact food photography is data-dependent rather than a code-level fidelity issue.
- Copy: labels were adjusted from the concept to match actual behavior—“复制新建接龙” describes the template-copy workflow, and “全部接龙” avoids implying a daily-only query.

**Full-view comparison evidence**

- Header, three-column summary, dominant creation CTA, active-campaign grouped list, upcoming section, and product-management entry appear in the same order and with the same visual hierarchy as the source.
- The implementation intentionally uses the native uni-app navigation bar above app-owned content; the source omitted device and platform chrome.

**Focused region comparison evidence**

- Summary/CTA: counts align in three equal columns and the CTA remains the strongest element.
- Campaign rows: image, title, deadline, order/product metrics, and edit/end/hide actions remain visually grouped with row separators.
- Product entry: low-stock warning remains visible as the supporting admin task.

**Comparison history**

1. Initial 390 × 844 capture showed only one active campaign because a fixed 20:00 preview deadline had already passed. This caused a P2 mismatch between the summary and selected source state.
2. Preview data was changed to use a future relative deadline. The revised browser capture shows 2 active and 1 upcoming campaign, matching the source state; no P0/P1/P2 issues remain.

**Primary interactions tested**

- Opened the product-management route from the dashboard.
- Entered “葡萄” in product search and confirmed the list filtered to one matching item.
- Opened the all-campaigns route and confirmed active/upcoming status grouping and action rows rendered.
- Checked the final fresh browser tab for console warnings and errors; none were present.
- Opened the product picker from campaign editing and confirmed its default order presents the newest preview products first.
- Searched for “葡萄”, confirmed the option list narrowed to one result, selected it, and confirmed the selected count changed from 1 to 2 without losing the earlier selection.

**Implementation Checklist**

- [x] Mobile task-summary dashboard
- [x] Campaign status list and quick actions
- [x] Product list, search, stock warning, and edit entry
- [x] Server-paginated campaign product picker with newest-first ordering, debounced search, and persistent selection
- [x] Responsive 390 px layout
- [x] H5 preview and WeChat production builds

**Follow-up Polish**

- P3: verify final food-image crops against live cloud data in WeChat DevTools after deploying the updated cloud functions.

final result: passed
