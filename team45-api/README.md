# team45-api

# Getting Started

## Prerequisites

### Node (v22)

[Download Link](https://nodejs.org/en/download)

or using cmd/powershell

```markdown
# Download and install fnm:
winget install Schniz.fnm

# Download and install Node.js:
fnm install 22

# Verify the Node.js version:
node -v # Should print "v22.15.0".

# Verify npm version:
npm -v # Should print "10.9.2".
```

### MySQL

[Download Link](https://dev.mysql.com/doc/mysql-installation-excerpt/5.7/en/)

## Installation

```markdown
# Clone the repository
git clone https://github.com/IFMTYP2025/team45-api.git

# Navigate the directory
cd team45-api

# Install all required packages
npm install

# Include your .env file
# Please modify the examples in it according to your setup
cp .env.example .env

```

## Starting the api

```markdown
# To be able to restart the server upon saving a file
npm run dev

# To build the project to javascript 
npm run build

# To run the now compiled javascript
npm run run

```
