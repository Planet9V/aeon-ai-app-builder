# Contributing to AEON AI App Builder

Thank you for your interest in contributing! AEON AI App Builder is built with collaboration in mind.

## 🤝 How to Contribute

### Reporting Bugs

- Use GitHub Issues
- Include reproduction steps
- Provide environment details
- Share error messages and logs

### Suggesting Features

- Open a GitHub Discussion first
- Describe the use case
- Explain expected behavior
- Consider backwards compatibility

### Code Contributions

1. **Fork the repository**
2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/aeon-ai-app-builder.git
   ```

3. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes**
   - Follow existing code style
   - Add tests for new features
   - Update documentation

5. **Run tests**

   ```bash
   npm run typecheck
   npm run test
   npm run lint
   ```

6. **Commit your changes**

   ```
   feat(scope): add new feature
   fix(scope): resolve bug
   docs(scope): update documentation
   test(scope): add tests
   ```

7. **Push and create Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📝 Code Style

- TypeScript with strict mode
- No semicolons
- Single quotes
- 2-space indentation
- 120 character line width
- Prefer `const` over `let`
- Avoid unnecessary destructuring

## 🧪 Testing

- Write tests for all new features
- Maintain existing test coverage
- Use Vitest framework
- Follow AAA pattern (Arrange, Act, Assert)

## 📚 Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for public APIs
- Update CHANGELOG.md
- Document breaking changes

## 🙏 Credits

All contributors will be acknowledged in the project.

---

Created by Jim McKenney with AEON AI
