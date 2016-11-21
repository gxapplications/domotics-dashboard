'use strict'

export const dialogController = function ($scope, $mdDialog) {
  $scope.hide = () => {
    $mdDialog.hide()
  }
  $scope.cancel = () => {
    $mdDialog.cancel()
  }
  $scope.answer = (answer) => {
    $mdDialog.hide(answer)
  }
}

const hue = (component, x, y) => {
  return (x <= component.w && y <= component.h) ? 'md-hue-3' : 'md-hue-1'
}

export const dialogTemplate = function (component) {
  return `
  <md-dialog layout-padding>
    <h2>Choose width and height</h2>
    <table>
    <tr>
      <td>
        <md-button class="md-raised md-accent ${hue(component, 1, 1)}" ng-click="answer({w:1, h:1})">1x1</md-button>
      </td>
      <td>
        <md-button class="md-raised md-accent ${hue(component, 2, 1)}" ng-click="answer({w:2, h:1})">2x1</md-button>
      </td>
      <td>
        <md-button class="md-raised md-accent ${hue(component, 3, 1)}" ng-click="answer({w:3, h:1})">3x1</md-button>
      </td>
      <td>
        <md-button class="md-raised md-accent ${hue(component, 4, 1)}" ng-click="answer({w:4, h:1})">4x1</md-button>
      </td>
      <td>
        <md-button class="md-raised md-accent ${hue(component, 5, 1)}" ng-click="answer({w:5, h:1})">5x1</md-button>
      </td>
      <td>
        <md-button class="md-raised md-accent ${hue(component, 6, 1)}" ng-click="answer({w:6, h:1})">6x1</md-button>
      </td>
    </tr>
    <tr>
      <td>
        <md-button class="md-raised md-accent ${hue(component, 1, 2)}" ng-click="answer({w:1, h:2})">1x2</md-button>
      </td>
      <td>
        <md-button class="md-raised md-accent ${hue(component, 2, 2)}" ng-click="answer({w:2, h:2})">2x2</md-button>
      </td>
      <td>
        <md-button class="md-raised md-accent ${hue(component, 3, 2)}" ng-click="answer({w:3, h:2})">3x2</md-button>
      </td>
      <td>
        <md-button class="md-raised md-accent ${hue(component, 4, 2)}" ng-click="answer({w:4, h:2})">4x2</md-button>
      </td>
      <td>
        <md-button class="md-raised md-accent ${hue(component, 5, 2)}" ng-click="answer({w:5, h:2})">5x2</md-button>
      </td>
      <td>
        <md-button class="md-raised md-accent ${hue(component, 6, 2)}" ng-click="answer({w:6, h:2})">6x2</md-button>
      </td>
    </tr>
    <tr>
      <td>
        <md-button class="md-raised md-accent ${hue(component, 1, 3)}" ng-click="answer({w:1, h:3})">1x3</md-button>
      </td>
      <td>
        <md-button class="md-raised md-accent ${hue(component, 2, 3)}" ng-click="answer({w:2, h:3})">2x3</md-button>
      </td>
      <td>
        <md-button class="md-raised md-accent ${hue(component, 3, 3)}" ng-click="answer({w:3, h:3})">3x3</md-button>
      </td>
      <td>
        <md-button class="md-raised md-accent ${hue(component, 4, 3)}" ng-click="answer({w:4, h:3})">4x3</md-button>
      </td>
      <td>
        <md-button class="md-raised md-accent ${hue(component, 5, 3)}" ng-click="answer({w:5, h:3})">5x3</md-button>
      </td>
      <td>
        <md-button class="md-raised md-accent ${hue(component, 6, 3)}" ng-click="answer({w:6, h:3})">6x3</md-button>
      </td>
    </tr>
    <tr>
      <td>
        <md-button class="md-raised md-accent ${hue(component, 1, 4)}" ng-click="answer({w:1, h:4})">1x4</md-button>
      </td>
      <td>
        <md-button class="md-raised md-accent ${hue(component, 2, 4)}" ng-click="answer({w:2, h:4})">2x4</md-button>
      </td>
      <td>
        <md-button class="md-raised md-accent ${hue(component, 3, 4)}" ng-click="answer({w:3, h:4})">3x4</md-button>
      </td>
      <td>
        <md-button class="md-raised md-accent ${hue(component, 4, 4)}" ng-click="answer({w:4, h:4})">4x4</md-button>
      </td>
      <td>
        <md-button class="md-raised md-accent ${hue(component, 5, 4)}" ng-click="answer({w:5, h:4})">5x4</md-button>
      </td>
      <td>
        <md-button class="md-raised md-accent ${hue(component, 6, 4)}" ng-click="answer({w:6, h:4})">6x4</md-button>
      </td>
    </tr>
    <tr>
      <td>
        <md-button class="md-raised md-accent ${hue(component, 1, 5)}" ng-click="answer({w:1, h:5})">1x5</md-button>
      </td>
      <td>
        <md-button class="md-raised md-accent ${hue(component, 2, 5)}" ng-click="answer({w:2, h:5})">2x5</md-button>
      </td>
      <td>
        <md-button class="md-raised md-accent ${hue(component, 3, 5)}" ng-click="answer({w:3, h:5})">3x5</md-button>
      </td>
      <td>
        <md-button class="md-raised md-accent ${hue(component, 4, 5)}" ng-click="answer({w:4, h:5})">4x5</md-button>
      </td>
      <td>
        <md-button class="md-raised md-accent ${hue(component, 5, 5)}" ng-click="answer({w:5, h:5})">5x5</md-button>
      </td>
      <td>
        <md-button class="md-raised md-accent ${hue(component, 6, 5)}" ng-click="answer({w:6, h:5})">6x5</md-button>
      </td>
    </tr>
    <tr>
      <td>
        <md-button class="md-raised md-accent ${hue(component, 1, 6)}" ng-click="answer({w:1, h:6})">1x6</md-button>
      </td>
      <td>
        <md-button class="md-raised md-accent ${hue(component, 2, 6)}" ng-click="answer({w:2, h:6})">2x6</md-button>
      </td>
      <td>
        <md-button class="md-raised md-accent ${hue(component, 3, 6)}" ng-click="answer({w:3, h:6})">3x6</md-button>
      </td>
      <td>
        <md-button class="md-raised md-accent ${hue(component, 4, 6)}" ng-click="answer({w:4, h:6})">4x6</md-button>
      </td>
      <td>
        <md-button class="md-raised md-accent ${hue(component, 5, 6)}" ng-click="answer({w:5, h:6})">5x6</md-button>
      </td>
      <td>
        <md-button class="md-raised md-accent ${hue(component, 6, 6)}" ng-click="answer({w:6, h:6})">6x6</md-button>
      </td>
    </tr>
    </table>
  </md-dialog>
`
}
