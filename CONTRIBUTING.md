# Contributing to AWS Cost Optimization Platform

Thank you for contributing to the AWS Cost Optimization Platform! This guide will help you get started with development and maintain code quality.

## 🚀 Getting Started

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aws-cost-optimization-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 📋 Development Guidelines

### Code Style

- **TypeScript**: Use TypeScript for all new files
- **Formatting**: Use the built-in linter and formatter
- **Naming**: Use descriptive variable and function names
- **Comments**: Add JSDoc comments for complex functions

### File Structure

```
src/app/
├── components/          # Reusable UI components
├── api/                 # API routes and backend logic
├── [page-name]/         # Page-specific components and styles
└── globals.css          # Global styles
```

### Component Guidelines

- Use functional components with hooks
- Keep components small and focused
- Use TypeScript interfaces for props
- Include error handling and loading states

### API Development

- All API routes in `src/app/api/`
- Use proper HTTP status codes
- Include error handling
- Validate input data
- Add type definitions for request/response

## 🧪 Testing

### Running Tests

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### Manual Testing

1. Test file uploads with various formats
2. Verify calculations with known datasets
3. Test responsive design on different screen sizes
4. Verify error handling with invalid inputs

## 🔄 Workflow

### Branch Strategy

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/feature-name`: New features
- `bugfix/issue-description`: Bug fixes
- `hotfix/critical-fix`: Critical production fixes

### Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow coding standards
   - Add tests if applicable
   - Update documentation

3. **Test your changes**
   ```bash
   npm run type-check
   npm run lint
   npm run build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new cost calculation feature"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Format

Use conventional commits:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or modifying tests
- `chore:` Maintenance tasks

## 📊 Adding New Features

### New AWS Regions

1. Update `regionalMultipliers` in `src/app/api/map-customer-region/route.ts`
2. Add region to dropdowns in forecast pages
3. Test calculations with new region
4. Update documentation

### New Lab Types

1. Update `labBaselineCosts` in API routes
2. Add to UI component options
3. Update consumption profiles
4. Test new lab type calculations

### New Cost Factors

1. Identify where the factor should be applied
2. Update calculation functions
3. Add UI controls if user-configurable
4. Update documentation and help text

## 🐛 Bug Reports

When reporting bugs:

1. **Use the issue template**
2. **Provide reproduction steps**
3. **Include environment details**
4. **Add screenshots if relevant**
5. **Describe expected vs actual behavior**

## 📈 Performance Considerations

- **Bundle Size**: Monitor JavaScript bundle size
- **Loading Times**: Optimize component loading
- **File Processing**: Handle large Excel files efficiently
- **Memory Usage**: Clean up resources after processing

## 🔒 Security Guidelines

- **Input Validation**: Validate all user inputs
- **File Uploads**: Sanitize uploaded files
- **API Keys**: Never commit API keys to git
- **Error Messages**: Don't expose sensitive information
- **Dependencies**: Keep dependencies updated

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for complex functions
- Document API endpoints
- Include usage examples
- Update README for new features

### User Documentation

- Update help text for new features
- Add tooltips for complex UI elements
- Create user guides for new workflows
- Update deployment documentation

## 🚀 Deployment

### Development Deployment

```bash
# Local development
npm run dev

# Local production build
npm run build && npm start

# Docker deployment
npm run docker:compose
```

### Production Deployment

1. **Review changes** in staging environment
2. **Run full test suite**
3. **Update version** in package.json
4. **Create release notes**
5. **Deploy to production**
6. **Monitor** for issues

## 🤝 Code Review

### Review Checklist

- [ ] Code follows style guidelines
- [ ] Changes are well-tested
- [ ] Documentation is updated
- [ ] No sensitive data exposed
- [ ] Performance impact considered
- [ ] Breaking changes documented

### Review Process

1. **Self-review** your code first
2. **Request reviewers** from team
3. **Address feedback** promptly
4. **Update based on comments**
5. **Get approval** before merging

## 📞 Getting Help

- **Documentation**: Check README and this guide first
- **Team Chat**: Use internal communication channels
- **Code Review**: Ask questions during review process
- **Architecture Decisions**: Discuss major changes with team lead

## 🎯 Best Practices

### Performance

- Use React.memo() for expensive components
- Implement proper loading states
- Optimize images and assets
- Monitor bundle size

### Accessibility

- Use semantic HTML elements
- Include alt text for images
- Ensure keyboard navigation works
- Test with screen readers

### SEO

- Use proper meta tags
- Implement structured data
- Optimize page loading speeds
- Use descriptive URLs

---

**Happy Coding!** 🚀

For questions or support, contact the development team. 