import mongoose from "mongoose";
import { connectDatabase } from "./database";
import { env } from "./env";
import { Category } from "../models/category.model";
import { Comment } from "../models/comment.model";
import { CommunitySettings } from "../models/communitySettings.model";
import { Dish } from "../models/dish.model";
import { Like } from "../models/like.model";
import { Restaurant } from "../models/restaurant.model";
import { DiningTable } from "../models/table.model";
import { User } from "../models/user.model";
import { buildPublicMenuUrl } from "../utils/qr";

const seed = async () => {
  await connectDatabase();

  const admin = await User.findOne({ email: env.adminSeedEmail });
  if (!admin) {
    await User.create({
      name: env.adminSeedName,
      email: env.adminSeedEmail,
      password: env.adminSeedPassword,
      role: "ADMIN",
      isActive: true,
    });
  }

  await Restaurant.findOneAndUpdate(
    {},
    {
      name: "Casa Aurora",
      logo: "logo-casa-aurora.png",
      description:
        "Cocina contemporanea con insumos locales, platos de temporada y cocteles de autor.",
      address: "Av. Principal 123, Lima",
      phone: "+51 999 888 777",
      whatsapp: "+51999888777",
      openingHours: "Lunes a domingo, 12:00 p.m. - 11:00 p.m.",
      socialLinks: {
        instagram: "https://instagram.com/casaaurora",
        facebook: "",
        tiktok: "",
        website: "https://casaaurora.example",
      },
      brandColors: {
        primary: "#173c34",
        accent: "#d96b43",
      },
      isActive: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const categories = await Promise.all(
    [
      { name: "Entradas", description: "Bocados para abrir el apetito.", order: 1 },
      { name: "Fondos", description: "Platos principales de la casa.", order: 2 },
      { name: "Bebidas", description: "Refrescos, cocteles y opciones sin alcohol.", order: 3 },
      { name: "Postres", description: "Finales dulces y ligeros.", order: 4 },
    ].map((category) =>
      Category.findOneAndUpdate({ name: category.name }, category, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }),
    ),
  );

  const [entradas, fondos, bebidas, postres] = categories;

  const seededDishes = await Promise.all(
    [
      {
        name: "Ceviche clasico",
        description: "Pesca fresca, leche de tigre, camote glaseado, choclo y cebolla crocante.",
        price: 42,
        image: "ceviche-clasico.jpg",
        categoryId: entradas._id,
        isFeatured: true,
        order: 1,
        tags: ["Mas vendido", "Fresco"],
      },
      {
        name: "Croquetas de aji amarillo",
        description: "Croquetas cremosas con salsa de hierbas, limon y queso madurado.",
        price: 28,
        image: "croquetas-aji.jpg",
        categoryId: entradas._id,
        order: 2,
        tags: ["Nuevo"],
      },
      {
        name: "Lomo saltado brasa",
        description: "Lomo sellado al wok, papas nativas, arroz graneado y jugo de carne.",
        price: 55,
        image: "lomo-saltado.jpg",
        categoryId: fondos._id,
        isFeatured: true,
        order: 1,
        tags: ["Recomendado", "Mas vendido"],
      },
      {
        name: "Risotto de hongos andinos",
        description: "Arroz arborio, hongos de estacion, parmesano y aceite de trufa.",
        price: 49,
        image: "risotto-hongos.jpg",
        categoryId: fondos._id,
        order: 2,
        tags: ["Vegetariano"],
      },
      {
        name: "Chicha morada especiada",
        description: "Maiz morado, pina, canela, clavo y un toque citrico.",
        price: 16,
        image: "chicha-morada.jpg",
        categoryId: bebidas._id,
        order: 1,
        tags: ["Sin alcohol"],
      },
      {
        name: "Suspiro de lucuma",
        description: "Crema de lucuma, merengue ligero y crumble de cacao.",
        price: 24,
        image: "suspiro-lucuma.jpg",
        categoryId: postres._id,
        isFeatured: true,
        order: 1,
        tags: ["Nuevo"],
      },
    ].map((dish) =>
      Dish.findOneAndUpdate({ name: dish.name }, dish, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }),
    ),
  );

  const [ceviche, _croquetas, lomo, risotto] = seededDishes;

  await CommunitySettings.findOneAndUpdate(
    {},
    {
      commentsEnabled: true,
      recommendationsEnabled: true,
      likesEnabled: true,
      showMostRecommended: true,
      showFeaturedComments: true,
      autoModerationEnabled: true,
      allowGuestDeleteComments: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const seededComments = await Promise.all(
    [
      {
        dishId: lomo._id,
        guestId: "seed-guest-carlos",
        guestName: "Carlos",
        content: "El Lomo Saltado estuvo espectacular, totalmente recomendado.",
        status: "VISIBLE",
        isFeatured: true,
        isPinned: true,
      },
      {
        dishId: ceviche._id,
        guestId: "seed-guest-ana",
        guestName: "Ana",
        content: "Muy fresco y con buen punto de limon. Volveria por este ceviche.",
        status: "VISIBLE",
        isFeatured: true,
        isPinned: false,
      },
      {
        dishId: risotto._id,
        guestId: "seed-guest-luisa",
        guestName: "Luisa",
        content: "Una opcion vegetariana muy lograda y cremosa.",
        status: "VISIBLE",
        isFeatured: false,
        isPinned: false,
      },
    ].map((comment) =>
      Comment.findOneAndUpdate(
        { guestId: comment.guestId, dishId: comment.dishId },
        comment,
        { upsert: true, new: true, setDefaultsOnInsert: true },
      ),
    ),
  );

  const [lomoComment, cevicheComment] = seededComments;

  await Promise.all(
    [
      { targetType: "DISH", targetId: lomo._id, dishId: lomo._id, guestId: "seed-guest-carlos", kind: "RECOMMENDATION" },
      { targetType: "DISH", targetId: lomo._id, dishId: lomo._id, guestId: "seed-guest-ana", kind: "RECOMMENDATION" },
      { targetType: "DISH", targetId: lomo._id, dishId: lomo._id, guestId: "seed-guest-luisa", kind: "LIKE" },
      { targetType: "DISH", targetId: ceviche._id, dishId: ceviche._id, guestId: "seed-guest-ana", kind: "RECOMMENDATION" },
      { targetType: "DISH", targetId: ceviche._id, dishId: ceviche._id, guestId: "seed-guest-carlos", kind: "LIKE" },
      { targetType: "DISH", targetId: risotto._id, dishId: risotto._id, guestId: "seed-guest-luisa", kind: "LIKE" },
      { targetType: "COMMENT", targetId: lomoComment._id, guestId: "seed-guest-ana", kind: "LIKE" },
      { targetType: "COMMENT", targetId: lomoComment._id, guestId: "seed-guest-luisa", kind: "LIKE" },
      { targetType: "COMMENT", targetId: cevicheComment._id, guestId: "seed-guest-carlos", kind: "LIKE" },
    ].map((like) =>
      Like.findOneAndUpdate(
        {
          guestId: like.guestId,
          targetType: like.targetType,
          targetId: like.targetId,
          kind: like.kind,
        },
        like,
        { upsert: true, new: true, setDefaultsOnInsert: true },
      ),
    ),
  );

  await Promise.all(
    seededComments.map(async (comment) => {
      const likeCount = await Like.countDocuments({
        targetType: "COMMENT",
        targetId: comment._id,
        kind: "LIKE",
      });
      return Comment.findByIdAndUpdate(comment._id, { likeCount });
    }),
  );

  await Promise.all(
    ["Mesa 1", "Mesa 2", "Terraza 1"].map((name) => {
      const code = name.replace(/\s+/g, "-").toUpperCase();
      return DiningTable.findOneAndUpdate(
        { code },
        { name, code, qrUrl: buildPublicMenuUrl(code), isActive: true },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
    }),
  );

  console.log("Seed completado");
  await mongoose.disconnect();
};

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
