// prisma/seed.ts
import { prisma } from "@/lib/prisma";

async function main() {
  const creditPackages = [
    {
      name: "Starter Pack",
      credits: 500,
      price: 1099, // 10.99
      stripePriceId: "prod_TFss0p6ygWg4zD", // replace with real test Price ID
      popular: false,
    },
    {
      name: "Growth Pack",
      credits: 1000,
      price: 1999, // 19.99
      stripePriceId: "prod_TFsv7Wd4QQmjVE", // replace with real test Price ID
      popular: true,
    },
    {
      name: "Pro Pack",
      credits: 2000,
      price: 6999, // 69.99
      stripePriceId: "prod_TFsviXbGOir8Zk", // replace with real test Price ID
      popular: false,
    },
  ];

  const subscriptionPlans = [
    {
      name: "Starter Monthly",
      description: "500 credits per month",
      monthlyCredits: 500,
      price: 499, // 4.99
      stripePriceId: "prod_TFsxbPnItebis8", // replace with real test Price ID
      features: ["500 credits/mo"],
      popular: false,
    },
    {
      name: "Growth Pack Monthly",
      description: "1000 credits per month",
      monthlyCredits: 1000,
      price: 1999, // 19.99
      stripePriceId: "prod_TFszWCzLFDvXc6", // replace with real test Price ID
      features: ["1000 credits/mo", "Email support", "Access to new features"],
      popular: true,
    },
    {
      name: "Pro Pack Monthly",
      description: "2000 credits per month",
      monthlyCredits: 2000,
      price: 6999, // 69.99
      stripePriceId: "prod_TFt1icKcf8oa7o", // replace with real test Price ID
      features: ["2000 credits/mo", "Email support", "Access to new features"],
      popular: false,
    },
  ];

  for (const pkg of creditPackages) {
    await prisma.creditPackage.upsert({
      where: { name: pkg.name },
      update: {
        credits: pkg.credits,
        price: pkg.price,
        stripePriceId: pkg.stripePriceId,
        popular: pkg.popular,
        updatedAt: new Date(),
      },
      create: pkg as any,
    });
    console.log(`Upserted CreditPackage: ${pkg.name}`);
  }

  for (const plan of subscriptionPlans) {
    await prisma.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: {
        description: plan.description,
        monthlyCredits: plan.monthlyCredits,
        price: plan.price,
        stripePriceId: plan.stripePriceId,
        features: plan.features as any,
        popular: plan.popular,
        updatedAt: new Date(),
      },
      create: plan as any,
    });
    console.log(`Upserted SubscriptionPlan: ${plan.name}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
