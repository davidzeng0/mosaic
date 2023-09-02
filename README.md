# mosaic
A collection of API and OAuth 2.0 clients

```bash
npm i github:davidzeng0/mosaic#dist
```

## Using a config file
Create a config file in your project named `mosaic_config.yaml`, and call
```ts
import { Config } from 'mosaic';

Config.use('mosaic_config.yaml');
```