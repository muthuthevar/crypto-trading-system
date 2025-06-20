pipeline {
    agent any
    
    environment {
        // Define your environment variables
        NODE_VERSION = '18'
        APP_NAME = 'crypto-trading-system'
        GITLAB_REPO = 'https://github.com/muthuthevar/crypto-trading-system.git'
        GITLAB_BRANCH = 'main'
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', 
                    credentialsId: 'github-credentials', 
                    url: 'https://github.com/muthuthevar/crypto-trading-system.git'
            }
        }
        
        stage('Docker Build') {
            steps {
                script {
                    docker build -t crypto-trading-system .
                }
            }
        }
        
        stage('Docker Run') {
            steps {
                script {
                    docker run -d -p 3000:3000 crypto-trading-system
                }
            }
        }
        
    }
    
    post {
        always {
            // Clean workspace
            cleanWs()
        }
        
        success {
            echo 'Deployment successful!'
            // Add notification logic here (Slack, email, etc.)
        }
        
        failure {
            echo 'Deployment failed!'
            // Rollback logic can be added here
            script {
                sh '''
                    cd /home/muthu/crypto-trading-system
                        PREVIOUS_RELEASE=\$(ls -t | sed -n '2p')
                        if [ ! -z \"\$PREVIOUS_RELEASE\" ]; then
                            echo 'Rolling back to previous release: '\$PREVIOUS_RELEASE
                            ln -sfn /home/muthu/crypto-trading-system/\$PREVIOUS_RELEASE /home/muthu/crypto-trading-system/current
                            npm start
                        fi
                '''
            }
        }
    }
}