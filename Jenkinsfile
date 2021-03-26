library 'magic-butler-catalogue'

def PROJECT_NAME = "manifold-signature"
def repo = "answerbook/${PROJECT_NAME}"

pipeline {
  agent none

  options {
    timestamps()
    ansiColor 'xterm'
  }

  stages {
    stage('Test Suite') {
      matrix {
        axes {
          axis {
            name 'NODE_VERSION'
            values '10', '12', '14'
          }
        }

        agent {
          docker {
            image "us.gcr.io/logdna-k8s/node:${NODE_VERSION}-ci"
          }
        }

        environment {
          GITHUB_PACKAGES_TOKEN = credentials('github-api-token')
          NPM_CONFIG_CACHE = '.npm'
          NPM_CONFIG_USERCONFIG = '.npm/rc'
          SPAWN_WRAP_SHIM_ROOT = '.npm'
        }

        stages {
          stage('Install') {
            steps {
              sh 'mkdir -p .npm coverage'
              script {
                npm.auth token: "${GITHUB_PACKAGES_TOKEN}"
              }
              sh 'npm install'
            }
          }

          stage('Test') {
            steps {
              sh 'npm run test:ci'
            }

            post {
              always {
                junit 'coverage/test.xml'
                publishHTML target: [
                  allowMissing: false,
                  alwaysLinkToLastBuild: false,
                  keepAll: true,
                  reportDir: 'coverage/lcov-report',
                  reportFiles: 'index.html',
                  reportName: "coverage-node-v${NODE_VERSION}"
                ]
              }
            }
          }
        }
      }
    }

    stage('Test Release') {
      when {
        beforeAgent true
        not {
          branch 'main'
        }
      }

      agent {
        docker {
          image "us.gcr.io/logdna-k8s/node:12-ci"
          customWorkspace "${PROJECT_NAME}-${BUILD_NUMBER}"
        }
      }

      environment {
        GITHUB_TOKEN = credentials('github-api-token')
        NPM_TOKEN = credentials('github-api-token')
        NPM_CONFIG_CACHE = '.npm'
        NPM_CONFIG_USERCONFIG = '.npm/rc'
        SPAWN_WRAP_SHIM_ROOT = '.npm'
        GIT_BRANCH = "${CURRENT_BRANCH}"
        BRANCH_NAME = "${CURRENT_BRANCH}"
        CHANGE_ID = ""
      }

      steps {
        script {
          sh 'mkdir -p .npm'
          npm.install "${GITHUB_TOKEN}"
          sh "npm run release -- --dry-run --no-ci --branches ${CURRENT_BRANCH}"
        }
      }
    }

    stage('Release') {
      when {
        beforeAgent true
        branch 'main'
      }

      agent {
        docker {
          image "us.gcr.io/logdna-k8s/node:12-ci"
          customWorkspace "${PROJECT_NAME}-${BUILD_NUMBER}"
        }
      }

      environment {
        GITHUB_TOKEN = credentials('github-api-token')
        NPM_TOKEN = credentials('github-api-token')
        NPM_CONFIG_CACHE = '.npm'
        NPM_CONFIG_USERCONFIG = '.npm/rc'
        SPAWN_WRAP_SHIM_ROOT = '.npm'
      }

      steps {
        script {
          sh 'mkdir -p .npm'
          npm.install "${GITHUB_TOKEN}"
          sh "npm run release"
        }
      }
    }
  }
}
