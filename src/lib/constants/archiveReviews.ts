import type { ReviewWithOrderItems } from "@/interfaces/review";

// Reviews customers sent before the site had a review form (Instagram /
// Telegram). Text is the customer's own words in the original language; dates
// are when each review was posted (taken from the Instagram story or confirmed
// by the owner). Photos are cropped from the same stories (public/reviews/).
// Names are masked by ReviewCard like every other review.

type Seed = {
  author: string;
  date: string;
  item: string;
  photo: string;
  body: string;
};

const SEEDS: Seed[] = [
  {
    author: "resident",
    date: "2024-11-21",
    item: "Air Jordan 1 High Gore-Tex",
    photo: "aj1-gore-tex",
    body: "Джорданы в живую просто супер. А за такую цену вдвойне кайф. Еще и вместо 2-3 недель за неделю на руки их получил. Спасибо за сервис. Теперь жду форсы. 😎",
  },
  {
    author: "leathercraftart",
    date: "2024-12-04",
    item: "Nike Air Force 1 Cordura",
    photo: "af1-cordura",
    body: "Большое спасибо, оперативно + очень приятная цена. На след неделе закажу третью пару.",
  },
  {
    author: "rsnipiq",
    date: "2025-02-07",
    item: "Air Jordan 3",
    photo: "aj3",
    body: "Привет. Забрал все отлично, спасибо",
  },
  {
    author: "a",
    date: "2025-07-03",
    item: "Jordan × Travis Scott T-Shirt",
    photo: "travis-tee",
    body: "Бро, от души за футболку, она просто раз**б. Давно за тобой слежу. Дальше — больше",
  },
  {
    author: "anna.montana.23",
    date: "2025-10-23",
    item: "Air Jordan 4 Cave Stone",
    photo: "aj4-cave-stone",
    body: "Кроссы забрала. Все супер. Выглядят еще лучше чем на фото",
  },
  {
    author: "t.stetskov98",
    date: "2025-11-30",
    item: "Nike Dunk Low Cordura",
    photo: "dunk-low-cordura",
    body: "Доброго ранку. Так все супер, дякую",
  },
  {
    author: "idkoby",
    date: "2026-02-12",
    item: "Stone Island Fleece Pants",
    photo: "si-fleece-pants",
    body: "Привет. Да спасибо все четко",
  },
  {
    author: "andr8kot",
    date: "2026-04-16",
    item: "Jordan × Travis Scott Hoodie",
    photo: "travis-hoodie",
    body: "Привіт. Все супер, будуть ще кофти пропонуй",
  },
  {
    author: "ggwp.0808",
    date: "2026-07-10",
    item: "Stone Island Nylon Cap",
    photo: "si-nylon-cap",
    body: "Приветствую. Забрал, вроде все гуд. Спасибо",
  },
  {
    author: "_gabriella_sabov",
    date: "2026-07-23",
    item: "Stone Island Zip Hoodie",
    photo: "si-zip-hoodie",
    body: "Дякую за річ і приємну співпрацю та розуміння, більше приємних клієнтів і класних позицій, хлопець каже більше шмоту в stories, бо ваш підбір речей йому дуже заходить (бо не однотипні речі як у більшості) 🤝👌",
  },
];

export const ARCHIVE_REVIEWS: ReviewWithOrderItems[] = SEEDS.map((s) => ({
  id: `archive-${s.photo}`,
  product_id: null,
  order_id: `archive-${s.photo}`,
  author_name: s.author,
  rating: 5,
  size_purchased: null,
  body: s.body,
  image_urls: [`/reviews/${s.photo}.jpg`],
  created_at: `${s.date}T12:00:00Z`,
  order_items: [{ name: s.item, selectedSize: "", price: 0 }],
}));
