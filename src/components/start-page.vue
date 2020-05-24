<template>
  <div class="card-expansion">
    <md-card>
      <md-card-media>
        <img src="../assets/card-sky.jpg"  alt="People">
      </md-card-media>

      <md-card-header>
        <div class="md-title">НУОЛХ</div>
        <div class="md-subhead">Гео-система</div>
      </md-card-header>

      <md-card-expand>
        <md-card-actions md-alignment="space-between">
          <md-card-expand-trigger>
            <md-button class="md-icon-button">
              <md-icon>keyboard_arrow_down</md-icon>
            </md-button>
          </md-card-expand-trigger>
        </md-card-actions>

        <md-card-expand-content>
          <md-card-content>
            Негорельский учебно-опытный лесхоз организован в мае 1948 г. С момента образования лесхоз был закреплен в качестве учебно-опытной базы за Белорусским лесотехническим институтом им. С. М. Кирова для проведения учебных, производственных, преддипломных практик студентов, а также выполнения опытной и научно-исследовательской работы сотрудниками и студентами института, инженерно-техническими работниками лесхоза. В настоящее время Негорельский учебно-опытный лесхоз состоит из трех лесничеств. Общая площадь лесхоза - 17107,6 га, на которой расположены охотничье хозяйство, 1 питомник, музей природы, производственно-техническая база, ботанический сад площадью 25 га, насчитывающий более 600 видов древесно-кустарниковых пород многих стран мира.
          </md-card-content>
        </md-card-expand-content>
      </md-card-expand>
    </md-card>
  </div>
</template>

<script>
    export default {
        name: "start-page"
    }
</script>

<style scoped>
  .md-card {
    width: 40%;
    margin: 4px;
    display: inline-block;
    vertical-align: top;
  }
</style>
