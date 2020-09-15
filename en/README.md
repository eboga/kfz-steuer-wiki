## How to

### FAQ

```twig
<div class="c-FAQ c-FAQ--it c-FAQ--ib" markdown="0">
    {%- assign faqs = site.data[site.lang].faqs.default -%}
    {%- include faq.html faqs = faqs wrapper = false -%}
</div>
```