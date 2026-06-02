import bcrypt from 'bcryptjs'
import { createInterface } from 'readline'

const rl = createInterface({ input: process.stdin, output: process.stdout })

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve))
}

async function main() {
  console.log('=== Generator Password Hash ===\n')

  const adamPass = await question('Password untuk Adam: ')
  const rifdaPass = await question('Password untuk Rifda: ')

  const adamHash = await bcrypt.hash(adamPass, 12)
  const rifdaHash = await bcrypt.hash(rifdaPass, 12)

  console.log('\n=== Salin ke file .env.local ===\n')
  console.log(`ADAM_PASSWORD_HASH="${adamHash}"`)
  console.log(`RIFDA_PASSWORD_HASH="${rifdaHash}"`)
  console.log('\n=== Selesai ===')

  rl.close()
}

main()
