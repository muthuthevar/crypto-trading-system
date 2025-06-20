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
        
        stage('Install Dependencies') {
            steps {
                script {
                    // Install Node.js dependencies locally for testing
                    sh '''
                        node --version
                        npm --version
                        npm ci
                    '''
                }
            }
        }
        
        stage('Run Tests') {
            steps {
                script {
                    // Run your test suite
                    sh '''
                        npm test
                    '''
                }
            }
        }
        
        stage('Build Application') {
            steps {
                script {
                    // Build the application if needed
                    sh '''
                        if [ -f "package.json" ] && grep -q '"build"' package.json; then
                            npm run build
                        else
                            echo "No build script found, skipping build step"
                        fi
                    '''
                }
            }
        }
        
        stage('Deploy to Local Machine') {
            steps {
                script {
                    // Deploy to Local Machine instance
                    sh '''
                        # Copy application files to Local Machine
                        cp -r ./* /home/muthu/crypto-trading-system
                        
                        # Install dependencies and setup application on Local Machine
                        cd /home/muthu/crypto-trading-system
                        npm ci --production
                        npm start
                    '''
                }
            }
        }
        
        stage('Cleanup Old Releases') {
            steps {
                script {
                    // Keep only last 5 releases
                    sh '''
                        cd /home/muthu/crypto-trading-system
                        ls -t | tail -n +6 | xargs rm -rf --
                    '''
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