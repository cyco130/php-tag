# php-tag

Write your PHP backend code right inside your frontend JavaScript code using tagged template literals:

```js
import { php } from "php-tag";

async function run() {
  // The return value is serialized to JSON and sent back
  const hello = await php`return "Hello world!";`;
  console.assert(hello === "Hello world!");

  // Interpolated values are serialized to JSON and sent to the backend
  const sum = await php`return ${12} + ${30};`;
  console.assert(sum === 42);
}
```

## Anticipated reactions

- **Oh the horror! Why? Just why?**

  Because I can :D

- **This is a terrible idea!**

  But colocation is good, isn't it? Like Next.js's `getServerSideProps` but for PHP backends. Is it _really_ that different? With some IDE support it could be pretty useful, methinks.

  Still not buying it? OK, neither am I.

- **Isn't it unsafe?**

  In production, it's no less safe than any other API endpoint. Just remember to treat interpolated values like any other user input and validate them.

## Actual reactions

![Reactions](https://github.com/cyco130/php-tag/raw/main/pics/reactions.png)

Interestingly the PHP community was more receptive thant the JavaScript community.

## How does it work?

`php-tag` comes in the form of a Vite plugin (`php-tag/vite-plugin`). If you want to use with other tools, the underlying Babel transform (`php-tag/babel-plugin`) is also available.

For the production build, the Babel transform extracts each piece of PHP code into its own PHP file with a unique name. The client sends this name along with the interpolated arguments as a POST request with a JSON body to the `/php-tag` and point. The backend is supposed to provide a dispatcher at that endpoint that loads the requested PHP file and executes it with the arguments sent.

During development, the client sends the code itself instead of a file name and the backend just `eval`s it.

## Getting started

```sh
# Clone the example
npx degit cyco130/php-tag/examples/basic php-tag-example
# Install dependencies
npm install
# Run the example in development mode
npm run dev

# Build the example
npm run build
# Preview the example
npm run preview
```

## Future ideas

- [ ] IDE support
- [ ] `python-tag`, `go-tag`, `java-tag` etc.
- [ ] Customization options
- [ ] More integration examples (Laravel, Symfony, etc.)

## What about `node-tag`?

[It already exists](https://stackblitz.com/edit/use-ssq?file=src%2Froutes%2Findex.page.tsx) in a much more useful and type-safe form. It will be available with the next version of [Rakkas](https://github.com/rakkasjs/rakkasjs/tree/next) in early August 2022.

## License

[MIT](./LICENSE)
