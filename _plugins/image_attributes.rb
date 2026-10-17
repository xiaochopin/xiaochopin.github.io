# frozen_string_literal: true

# 构建期为正文图片补上浏览器原生懒加载属性。
#
# 规则：
#   - 已经写了 loading / decoding 的 <img> 原样保留（首页 LCP 图已显式标注 eager）
#   - 其余 <img> 统一补 loading="lazy" decoding="async"
#
# 这样无需逐篇修改 Markdown，也不会影响 RSS 里的图片。
module XiaoChopin
  module ImageAttributes
    IMG_TAG = %r{<img\b[^>]*>}i

    module_function

    def apply(output)
      return output if output.nil? || !output.include?("<img")

      output.gsub(IMG_TAG) { |tag| decorate(tag) }
    end

    def decorate(tag)
      attrs = []
      attrs << 'loading="lazy"' unless tag.match?(/\bloading\s*=/i)
      attrs << 'decoding="async"' unless tag.match?(/\bdecoding\s*=/i)
      return tag if attrs.empty?

      closing = tag.end_with?("/>") ? "/>" : ">"
      body = tag[0...-closing.length].rstrip
      "#{body} #{attrs.join(' ')} #{closing}"
    end
  end
end

Jekyll::Hooks.register [:documents, :pages], :post_render do |doc|
  doc.output = XiaoChopin::ImageAttributes.apply(doc.output)
end
