class EntriesController < ApplicationController
  before_action :require_login, except: %i(index show)

  def index
    @user = User.active.find(params[:user_id]) if params[:user_id].present?
    @query = search_params
    respond_to do |format|
      format.html
      format.json {
        @form = Entries::SearchForm.new(current_user, @user, @query)
      }
    end
  end

  def show
    @entry = Entry.find(params[:id])
    raise NotFound unless @entry.readable_by?(current_user)
  end

  def new
    @entry = Entry.new
    respond_to do |format|
      format.html
      format.json { render :show }
    end
  end

  def edit
    @entry = current_user.entries.find(params[:id])
    respond_to do |format|
      format.html
      format.json { render :show }
    end
  end

  def create
    @entry = Entry.new
    @form = Entries::Form.new(current_user, @entry, entry_params)
    if @form.save
      flash.notice = '記事を作成しました。'
      render json: { location: entry_path(@entry) }
    else
      render json: { alert: '記事を作成できませんでした。', errors: @form.errors.full_messages },
        status: :unprocessable_entity
    end
  end

  def update
    @entry = current_user.entries.find(params[:id])
    @form = Entries::Form.new(current_user, @entry, entry_params)
    if @form.save
      flash.notice = '記事を更新しました。'
      render json: { location: entry_path(@entry) }
    else
      render json: { alert: '記事を更新できませんでした。', errors: @form.errors.full_messages },
        status: :unprocessable_entity
    end
  end

  def destroy
    @entry = current_user.entries.find(params[:id])
    @entry.destroy
    flash.notice = '記事を削除しました。'
    render json: { location: user_entries_path(current_user) }
  end

  private
  def search_params
    params.has_key?(:q) ? params[:q].permit! : {}
  end

  def entry_params
    params.require(:entry).permit(
      :title, :body, :published_at, :draft, tags: [ :name ]
    )
  end
end
