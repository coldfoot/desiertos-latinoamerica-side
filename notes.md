Location: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API/Using_the_Geolocation_API

https://css-tricks.com/gooey-effect/

https://stackoverflow.com/questions/59828938/multi-line-padded-text-with-outer-and-inner-rounded-corners-in-css


```js
map.queryRenderedFeatures({target: {layerId: 'countries-fills'}})
```

Menu paisage
`tipo-paisage-has-selection`
``


Ter uma variável "local", com todos os dados para os breadcrumbs
E ter uma função `render_place()`, por exemplo.

# Úteis

```js
map.queryRenderedFeatures({ layers: ['Chile-localidad'], }).map(d => d.properties.CLASSIFICATION).filter((d,i,a) => a.indexOf(d) == i)
```

# Data structures

Mais organizado ou flat?

Mais genérico, ou um array para cada país, para cada provincia?

```js

const dados_versao_pais = {

    "Argentina" : {

        'uts-maiores' : [
            {
                name : '',

                center : '',

                bbox : '',

                avg_value_of_variable : '',

                'etc'
            }
        ]

    }


}

const dados_versao_generico_hierarquicos = [

    {

        id : '',

        level : '', // country / ut_maior / ut_menor

        name : '',

        center : [], // [lat, lon]

        bbox : [], // [lat0, lon0, lat1, lon1]

        breadcrumbs : {

            country : '',
            ut_mayor : '',
            ut_menor : ''

        },

        header_data : {

            pop : '',
            superficie : '',
            proyectos : '',
            periodistas : ''

        },

        type : '', // desierto / semidesierto / ...

        distribution_types : {
            'desiertos' : '',
            'semidesiertos' : '',
            'semibosques' : '',
            'bosques' : ''
        },

        main_data : {

            // no caso de uts maiores e paises, trazer as médias?

            plataforma : '',
            vinculo_laboral : '',
            temas: '',
            ...         

        },

        relato : [p, p, ...],

        medio : ''

    }
]

const summary_data = [];

```

Pop-ups personalizados: https://www.datawrapper.de/blog/in-defense-of-simple-charts

Inspiration:
https://maartenlambrechts.com/2015/11/30/interactive-strip-plots-for-visualizing-demographics.html

Gooey Effect: https://css-tricks.com/gooey-effect/

# To-do

Deixar key, xc, yc, bbox?

[ ] fazer scrolly funcionar para colombia
[ ] páginas estáticas das províncias com múltiplos relatos (Argentina)
[ ] search bar, popular direito. não pesquisar no nome da Província?

[ ] Marcadores para ilhas do Chile
[x] Mapas estáticos para relatos
[x] Rótulos da viz para textos longos... (Buenos Aires)
[x] fazer menu paisage funcionar com Colombia.
[x] Estilizar scrolly,
[x] Atualizar texto do scrolly
[x] icones colombia
[x] Mapa Mexico
[x] Formatar número pop scrolly
[x] Parametrizar "provincia" / "estado" no scroller
[x] Fazer a página sempre voltar pro alto
[x] Mobile
[x] Completar "topics"
[x] Ajeitar relato
[x] Estilizar "datos"
[x] Download CSV
[ ] Download PNG
[x] Não Subtítulos programáticos na visualização?
[x] btn_leer_mas_colombia precisa de um listener diferente?
[x] popular dados da colombia no search
[x] corrigir search da colombia
[x] dados anteriores argentina

[x] Definit opacity, stroke-width no próprio svg com d3?

[x] Visualizações!
[x] Trocar bolhas por símbolos.
[x] Modal Relato
[x] Refinar CSS Dash
[x] Incluir caixas informativas.
[x] Ajustes no design, para aproximar
[x] visao inicial latam, pq esse zoom ridículo?
[x] textos dos países
[x] alterar render_provincia
[x] Passos da história
[x] Dash / Barras de percentuais
[x] Dash / Textos dos tipos de terreno
[x] Dados demais países história
[x]? Evitar que a pessoa caia no meio da história
[ ] Ver o toggle_highlight do UT menor. Método parece precisar de melhora.

Mudar bbox para América do Sul?
remover textos do estilo?
Reflow quando hover nos itens do menu de paises do dashboard
Flashes no mapa? Que diabo é isso?
Incluir tipo na argentina.
Por a camada do hover acima.
Leer MAs: incluir uma animação?

# Perguntas

Faz sentido ter o botão de tipo de terreno na visão global de todos os países juntos?

# Problemas

Monitor de eventos não parece estar sendo desligado

# Ideias scroller

```js
            monitora_steps : () => {

                const steps = document.querySelectorAll('.linechart-steps-regioes');

                steps.forEach(step => {

                    const step_name = step.dataset.linechartStep;
                    const selector = '[data-linechart-step="' + step_name + '"]';

                    gsap.to(

                        selector, // só para constar, não vamos fazer nada com ele, na verdade

                        {
                            scrollTrigger : {
                                trigger: selector,
                                markers: false,
                                toggleClass: 'active',
                                pin: false,
                                start: "25% 60%",
                                end: "75% 40%", 

                                onEnter : () => v.scroller.linechart_regioes.render[step_name](forward = true),
                                onEnterBack : () => v.scroller.linechart_regioes.render[step_name](forward = false),
                                onLeave : () => v.scroller.linechart_regioes.render[step_name](forward = true),
                                onLeaveBack : () => v.scroller.linechart_regioes.render[step_name](forward = false)

                            }
        
                        })
                    ;


                })
```


Proposta botões.
```css
.text-panel-container .conteudo .leer-mas {
    font-weight: bold;
    background-color: var(--color-bg);
    /* padding: .25rem .5rem .25rem .5rem; */
    font-size: 1em;
    color: var(--color-text);
    display: inline-block;
    text-transform: uppercase;
    border-radius: 16px;
    padding: 0px 40px 0 16px;
    color: var(--color-bg);
    font-family: nagel;
    cursor: pointer;
    background-color: var(--color-text);
    position: relative;
    height: 32px;
    border: 1px solid var(--color-text);
}

.text-panel-container .conteudo .leer-mas::after{
    position: absolute;
    right: -1px;
    top: -1px;
    bottom: 0;
    content: '+';
    font-size: 30px;
    border-radius: 50%;
    background-color: var(--color-bg);
    color: var(--color-text);
    border: 1px solid currentColor;
    height: 30px;
    width: 30px;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: normal;
}

.text-panel-container .conteudo .leer-mas:hover {
    color: var(--color-accent);
    background-color: var(--color-bg);
    border-color: currentColor;
}

.text-panel-container .conteudo .leer-mas:hover::after {
    background-color: var(--color-accent);
    color: var(--color-bg);
    border-color: var(--color-accent);

}
```


```js
function recalcula_topico(lista, topico) {

    const news_org_count = lista.map(d => d.BASIC_INFO.NEWS_ORG_COUNT).reduce( (a,b) => a+b);

    const new_values = {};
    
    const keys = Object.keys(lista[0][topico]);

    keys.forEach(key => {

        if (key.search("_PCT") > -1) {
            key_original = key.slice(0,-4);
            new_values[key] = +(new_values[key_original] / news_org_count).toFixed(3)
        } else {
            new_values[key] = lista.map(d => d[topico][key]).reduce( (a,b) => a + b)
        }

    })

    return new_values
}
```

"Cordoba-Sur__argentina"
"Cordoba-Norte__argentina"
"Santa-Fe-CentroSur__argentina"
"Santa-Fe-Norte__argentina"
"Buenos-Aires-Conurbano__argentina"
"Buenos-Aires-Zona-2__argentina"
"Buenos-Aires-Zona-3__argentina"


&setfilter=["==","KEY","Catamarca__argentina"]&layer_id=argentina-provincia-border

mapbox://styles/tiagombp/cmdrid0x700jq01qp87mp2zap

https://api.mapbox.com/styles/v1/tiagombp/cmdq1xmlj00kf01s275sy99eq/static/%5B-69.095264,-30.119602,-64.780965,-25.168313%5D/600x600?padding=50&access_token=pk.eyJ1IjoidGlhZ29tYnAiLCJhIjoiY2thdjJmajYzMHR1YzJ5b2huM2pscjdreCJ9.oT7nAiasQnIMjhUB-VFvmw&setfilter=[%22==%22,%22KEY%22,%22Catamarca__argentina%22]&layer_id=argentina-provincia-border



vou me orgulhar da ideia de por um [data-view] e um [data-country] no body do HTML, pq fica super fácil de controlar o que aparece e o que some em cada nível / país. Só especificar no css, o código só precisa se preocupar em setar o view e o country direito.