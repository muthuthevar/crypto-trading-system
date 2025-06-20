pipeline {
    agent {
        docker {
            image 'docker:latest'
            args '-v /var/run/docker.sock:/var/run/docker.sock --user root'
        }
    }
    
    environment {
        // Define your application variables
        APP_NAME = 'crypto-trading-system'
        DOCKER_IMAGE = "${APP_NAME}:${BUILD_NUMBER}"
        DOCKER_IMAGE_LATEST = "${APP_NAME}:latest"
        CONTAINER_NAME = "${APP_NAME}-container"
        HOST_PORT = '8080'
        CONTAINER_PORT = '8080'
    }
    
    stages {
        stage('Cleanup Workspace') {
            steps {
                echo 'Cleaning up workspace...'
                cleanWs()
            }
        }
        
        stage('Clone Repository') {
            steps {
                echo 'Cloning Git repository...'
                git branch: 'main',
                    url: 'https://github.com/muthuthevar/crypto-trading-system.git'
                
                // List files to verify clone
                sh 'ls -la'
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                script {
                    // Build Docker image with build number tag
                    sh "docker build -t ${DOCKER_IMAGE} ."
                    
                    // Tag as latest
                    sh "docker tag ${DOCKER_IMAGE} ${DOCKER_IMAGE_LATEST}"
                    
                    // List Docker images to verify build
                    sh 'docker images | grep ${APP_NAME}'
                }
            }
        }
        
        stage('Stop Existing Container') {
            steps {
                echo 'Stopping and removing existing container if running...'
                script {
                    // Stop container if running (ignore errors if not running)
                    sh """
                        docker stop ${CONTAINER_NAME} || true
                        docker rm ${CONTAINER_NAME} || true
                    """
                }
            }
        }
        
        stage('Deploy Application') {
            steps {
                echo 'Deploying application...'
                script {
                    // Run the Docker container
                    sh """
                        docker run -d \\
                            --name ${CONTAINER_NAME} \\
                            -p ${HOST_PORT}:${CONTAINER_PORT} \\
                            --restart unless-stopped \\
                            ${DOCKER_IMAGE_LATEST}
                    """
                    
                    // Wait a moment for container to start
                    sleep(time: 5, unit: 'SECONDS')
                    
                    // Check if container is running
                    sh "docker ps | grep ${CONTAINER_NAME}"
                }
            }
        }
        
        stage('Health Check') {
            steps {
                echo 'Performing health check...'
                script {
                    // Basic health check - verify container is running
                    def containerStatus = sh(
                        script: "docker inspect -f '{{.State.Running}}' ${CONTAINER_NAME}",
                        returnStdout: true
                    ).trim()
                    
                    if (containerStatus == 'true') {
                        echo 'Container is running successfully!'
                        
                        // Optional: HTTP health check if your app has a health endpoint
                        // sh 'curl -f http://localhost:${HOST_PORT}/health || exit 1'
                    } else {
                        error 'Container failed to start properly'
                    }
                }
            }
        }
        
        stage('Cleanup Old Images') {
            steps {
                echo 'Cleaning up old Docker images...'
                script {
                    // Remove dangling images
                    sh 'docker image prune -f'
                    
                    // Optional: Remove old tagged images (keep last 3 builds)
                    sh """
                        docker images ${APP_NAME} --format "table {{.Tag}}" | grep -E '^[0-9]+\$' | sort -nr | tail -n +4 | xargs -I {} docker rmi ${APP_NAME}:{} || true
                    """
                }
            }
        }
    }
    
    post {
        always {
            echo 'Pipeline execution completed'
            
            // Display running containers
            sh 'echo "Currently running containers:"'
            sh 'docker ps'
            
            // Display application logs (last 20 lines)
            sh "echo 'Application logs:'"
            sh "docker logs --tail 20 ${CONTAINER_NAME} || true"
        }
        
        success {
            echo 'Pipeline executed successfully!'
            echo "Application is running at: http://localhost:${HOST_PORT}"
        }
        
        failure {
            echo 'Pipeline failed!'
            
            // Show container logs for debugging
            sh "docker logs ${CONTAINER_NAME} || true"
            
            // Cleanup failed deployment
            sh """
                docker stop ${CONTAINER_NAME} || true
                docker rm ${CONTAINER_NAME} || true
            """
        }
    }
}