# Blog

Rails 6とReactによるフォームのサンプルです。

masterブランチでは、Hooksを使っています。

`class extends React.Component` を使ったバージョンを別ブランチにしています。
- https://github.com/kazubon/blog-rails6-react/tree/extend

Vue.js版もあります: https://github.com/kazubon/blog-rails6-vuejs/ <br>
Qiita記事: https://qiita.com/kazutosato/items/b046ea203533af08acdb

## 動作環境

Ruby 2.6.5、Ruby on Rails 6.0, Webpacker 4.2, React 16.12

非SPA、Turbolinksあり

## 開発環境の用意

```
$ bundle install
$ yarn install
$ bin/rails db:migrate
$ bin/rails db:seed
```

db/seeds/development/users.rb にあるユーザー（`alice@example.com` / `password` など）でログインしてください。

## 作っていない機能

- ユーザーの新規登録、アカウント管理
