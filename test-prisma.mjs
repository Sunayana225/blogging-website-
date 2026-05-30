import('@prisma/client').then(({ PrismaClient }) => {
  const prisma = new PrismaClient()
  ;(async () => {
    try {
      const timestamp = Date.now()
      const email = `test+${timestamp}@example.com`
      const user = await prisma.user.create({
        data: {
          email,
          name: "Sunayana Test",
        },
      })
      console.log('Created user:', { id: user.id, email: user.email, name: user.name })

      // cleanup
      await prisma.user.delete({ where: { id: user.id } })
      console.log('Deleted test user')
    } catch (err) {
      console.error('Prisma test error:')
      console.error(err)
      process.exitCode = 1
    } finally {
      await prisma.$disconnect()
    }
  })()
})
