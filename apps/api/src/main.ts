import { NestFactory } from '@nestjs/core'
import { json, urlencoded } from 'body-parser'
import { env } from '~/utils/env'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // https://qiita.com/saba_can00/items/60bf9229a8452f57df1d
  app.use(json({ limit: '1mb' }))
  app.use(urlencoded({ limit: '30mb', extended: true }))

  await app.listen(env.PORT)
}
bootstrap()
