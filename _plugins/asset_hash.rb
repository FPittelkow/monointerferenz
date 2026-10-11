# frozen_string_literal: true

require "digest"

# Content-based cache busting for static assets.
#
#   href="{{ "/css/main.css" | relative_url }}?v={{ "css/main.css" | asset_hash }}"
#
# The digest is computed from the asset's source bytes, so the version string
# only changes when the file's content changes. Unchanged assets therefore stay
# in the browser cache across deploys, while changed ones are fetched at once.
#
# For Sass output (e.g. "css/main.css") the self-contained source
# (css/main.scss) is hashed, because the compiled file does not exist yet while
# pages are rendering. Keep css/main.scss free of imports so its content remains
# a faithful proxy for the compiled CSS.
module Jekyll
  module AssetHashFilter
    def asset_hash(path)
      site = @context.registers[:site]
      source = asset_hash_source(site, path)

      unless source
        Jekyll.logger.warn "AssetHash:", "no source file found for #{path.inspect}"
        return ""
      end

      Digest::MD5.file(source).hexdigest[0, 8]
    end

    # Hash an arbitrary string, e.g. a capture of the data that feeds the
    # generated search index, so a dynamic asset (search.json) can be versioned
    # by its input content rather than by build time.
    def content_hash(input)
      Digest::MD5.hexdigest(input.to_s)[0, 8]
    end

    private

    # Prefer the asset itself; fall back to the Sass source for generated CSS.
    def asset_hash_source(site, path)
      candidates = [path]
      candidates << path.sub(/\.css\z/, ".scss") if path.end_with?(".css")

      candidates
        .map { |candidate| File.join(site.source, candidate) }
        .find { |file| File.file?(file) }
    end
  end
end

Liquid::Template.register_filter(Jekyll::AssetHashFilter)
