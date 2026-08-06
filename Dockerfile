FROM php:7.4.33-apache
 
# Set working directory
WORKDIR /var/www/html
 
# Install system dependencies and PHP extensions
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    libicu-dev \
&& docker-php-ext-configure intl \
&& docker-php-ext-install \
        pdo_mysql \
        mysqli \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        zip \
        intl \
&& a2enmod rewrite headers \
&& apt-get clean \
&& rm -rf /var/lib/apt/lists/*
 
# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
 
# Set Apache document root to public directory
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
 
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' \
    /etc/apache2/sites-available/*.conf \
&& sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' \
    /etc/apache2/apache2.conf \
    /etc/apache2/conf-available/*.conf
 
# Copy application files
COPY . /var/www/html
 
# Install PHP dependencies
RUN composer install \
    --no-interaction \
    --optimize-autoloader \
    --no-dev \
    --prefer-dist \
    --no-progress
 
# Create writable directories
RUN mkdir -p \
    /var/www/html/writable/cache \
    /var/www/html/writable/logs \
    /var/www/html/writable/session \
    /var/www/html/writable/uploads
 
# Set permissions
RUN chown -R www-data:www-data /var/www/html \
&& chmod -R 755 /var/www/html \
&& chmod -R 775 /var/www/html/writable \
&& chmod -R 775 /var/www/html/public
 
# Copy custom PHP configuration
COPY docker/php/local.ini /usr/local/etc/php/conf.d/local.ini
 
# Expose port 80
EXPOSE 80
 
# Start Apache
CMD ["apache2-foreground"]