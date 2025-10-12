| Attribute          | Description                                   | Values / Type                          | Default                     |
| ------------------ | --------------------------------------------- | -------------------------------------- | --------------------------- |
| `marq-instance`    | Unique marquee ID                             | string                                 | —                           |
| `marq-el`          | Defines element role                          | `"wrapper"`, `"list"`, `"item"`        | —                           |
| `marq-direction`   | Scroll direction                              | `"ltr"`, `"rtl"`, `"ttb"`, `"btt"`     | `ltr`                       |
| `marq-pause`       | Pause on hover                                | `"true"` / `"false"`                   | `false`                     |
| `marq-fade`        | Fade-in duration (ms)                         | number                                 | `0`                         |
| `marq-easeout`     | Ease in/out duration (ms)                     | number                                 | `0`                         |
| `marq-breakpoints` | JSON object defining speed per viewport width | e.g. `{"1440":80,"991":100,"480":120}` | `{1440:80,991:100,480:120}` |
