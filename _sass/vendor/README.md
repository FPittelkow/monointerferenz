# Vendored stylesheet sources

Uncompiled Sass sources for the compiled stylesheets the site links to in
`_includes/head.html`:

- `hack.scss` → `css/hack.css`
- `style_standard.scss` → `css/style_standard.css`

They live under `_sass/` (which Jekyll does not copy into the output) so the
built site only ships the compiled `.css`. Edit these sources, then recompile
into the matching file in `css/`. They are intentionally not part of the
Jekyll Sass build.
