// v-reveal: adds "in-view" once the element crosses the viewport, driving
// the .hub-reveal keyframe in hub.css. Use v-reveal="i" for staggered groups
// (sets --hub-i so CSS can offset the delay).
const observer =
  typeof IntersectionObserver !== 'undefined'
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('in-view')
              observer.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
      )
    : null

export const vReveal = {
  mounted(el, binding) {
    el.classList.add('hub-reveal')
    if (binding.value !== undefined) {
      el.classList.add('hub-stagger')
      el.style.setProperty('--hub-i', binding.value)
    }
    if (observer) observer.observe(el)
    else el.classList.add('in-view')
  },
  unmounted(el) {
    if (observer) observer.unobserve(el)
  },
}
